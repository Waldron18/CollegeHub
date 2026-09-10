import { PrismaClient, Role, PaymentStatus, ChannelType, AttendanceStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding CollegeHub Academic Database...')

  const passwordHash = await bcrypt.hash('password123', 10)
  const adminPasswordHash = await bcrypt.hash('admin123', 10)

  // 1. Department: Computer Engineering
  const department = await prisma.department.upsert({
    where: { code: 'CE' },
    update: {},
    create: {
      name: 'Computer Engineering',
      code: 'CE',
    },
  })
  console.log('Created Department:', department.name)

  // 2. Community: Computer Engineering Hub
  const community = await prisma.community.upsert({
    where: { id: 'ce-hub-community' },
    update: {},
    create: {
      id: 'ce-hub-community',
      name: 'Computer Engineering Hub',
      departmentId: department.id,
    },
  })
  console.log('Created Community:', community.name)

  // Master Admin: Registrar Office / Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@college.edu' },
    update: {
      passwordHash: adminPasswordHash,
      prnNumber: 'ADMIN-001',
      role: Role.ADMIN,
      departmentId: department.id,
    },
    create: {
      name: 'Registrar Office / Admin',
      email: 'admin@college.edu',
      prnNumber: 'ADMIN-001',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      departmentId: department.id,
    },
  })
  console.log('Created Master Admin:', admin.name, 'Emp ID:', admin.prnNumber)

  // College Announcements Channel
  const announcementChannel = await prisma.channel.upsert({
    where: { id: 'channel-college-announcements' },
    update: {},
    create: {
      id: 'channel-college-announcements',
      name: 'College-Announcements',
      type: ChannelType.COLLEGE_ANNOUNCEMENT,
      communityId: community.id,
    },
  })
  console.log('Created Channel: #' + announcementChannel.name)

  // 3. Division: TE Div A (Semester 5)
  const division = await prisma.division.upsert({
    where: {
      name_departmentId: {
        name: 'TE Div A',
        departmentId: department.id,
      },
    },
    update: {},
    create: {
      name: 'TE Div A',
      semester: 5,
      departmentId: department.id,
    },
  })
  console.log('Created Division:', division.name)

  // 4. Faculty: Prof. Rajesh Kulkarni
  const faculty = await prisma.user.upsert({
    where: { email: 'rajesh.kulkarni@college.edu' },
    update: {
      passwordHash,
    },
    create: {
      name: 'Prof. Rajesh Kulkarni',
      email: 'rajesh.kulkarni@college.edu',
      passwordHash,
      role: Role.FACULTY,
      departmentId: department.id,
    },
  })
  console.log('Created Faculty:', faculty.name)

  // 5. Student: Aditya Sharma
  const student = await prisma.user.upsert({
    where: { email: 'aditya@college.edu' },
    update: {
      passwordHash,
      prnNumber: '22110482',
    },
    create: {
      name: 'Aditya Sharma',
      email: 'aditya@college.edu',
      prnNumber: '22110482',
      passwordHash,
      role: Role.STUDENT,
      departmentId: department.id,
      divisionId: division.id,
    },
  })
  console.log('Created Student:', student.name, 'PRN:', student.prnNumber)

  // 5b. Peer Students: Sneha Kale & Rohan Patil
  const student2 = await prisma.user.upsert({
    where: { email: 'sneha.kale@college.edu' },
    update: { passwordHash, prnNumber: '22110483' },
    create: {
      name: 'Sneha Kale',
      email: 'sneha.kale@college.edu',
      prnNumber: '22110483',
      passwordHash,
      role: Role.STUDENT,
      departmentId: department.id,
      divisionId: division.id,
    },
  })

  const student3 = await prisma.user.upsert({
    where: { email: 'rohan.patil@college.edu' },
    update: { passwordHash, prnNumber: '22110484' },
    create: {
      name: 'Rohan Patil',
      email: 'rohan.patil@college.edu',
      prnNumber: '22110484',
      passwordHash,
      role: Role.STUDENT,
      departmentId: department.id,
      divisionId: division.id,
    },
  })
  console.log('Created Peer Students: Sneha Kale & Rohan Patil')

  // 6. FeeTransaction for Aditya Sharma (COMPLETED)
  const feeTransaction = await prisma.feeTransaction.upsert({
    where: { transactionRef: 'TXN-2024-22110482-SEM5' },
    update: { status: PaymentStatus.COMPLETED, amount: 85000.0 },
    create: {
      userId: student.id,
      amount: 85000.0,
      status: PaymentStatus.COMPLETED,
      transactionRef: 'TXN-2024-22110482-SEM5',
    },
  })
  console.log('Created Fee Transaction:', feeTransaction.transactionRef, 'Status:', feeTransaction.status)

  // 7. 3 Subjects: Operating Systems, Database Management Systems, Computer Networks
  const subjectsData = [
    { name: 'Operating Systems', code: 'CS501', startTime: '09:00 AM', endTime: '10:00 AM', roomNumber: 'Lab 401', channelName: 'TE-DivA-OperatingSystems' },
    { name: 'Database Management Systems', code: 'CS502', startTime: '10:00 AM', endTime: '11:00 AM', roomNumber: 'Hall 304', channelName: 'TE-DivA-DatabaseManagementSystems' },
    { name: 'Computer Networks', code: 'CS503', startTime: '11:15 AM', endTime: '12:15 PM', roomNumber: 'Hall 201', channelName: 'TE-DivA-ComputerNetworks' },
  ]

  for (const sub of subjectsData) {
    // Create/upsert subject
    const subject = await prisma.subject.upsert({
      where: { code: sub.code },
      update: {},
      create: {
        name: sub.name,
        code: sub.code,
        departmentId: department.id,
      },
    })
    console.log('Created Subject:', subject.name, `(${subject.code})`)

    // Auto-enroll students into subject
    for (const s of [student, student2, student3]) {
      await prisma.enrollment.upsert({
        where: {
          studentId_subjectId: {
            studentId: s.id,
            subjectId: subject.id,
          },
        },
        update: {},
        create: {
          studentId: s.id,
          subjectId: subject.id,
        },
      })
    }
    console.log(`Enrolled students into ${subject.name}`)

    // Create channel under department community
    const channel = await prisma.channel.upsert({
      where: { id: `channel-${sub.code.toLowerCase()}` },
      update: {},
      create: {
        id: `channel-${sub.code.toLowerCase()}`,
        name: sub.channelName,
        type: ChannelType.SUBJECT_CHAT,
        communityId: community.id,
      },
    })
    console.log(`Created Channel: #${channel.name}`)

    // Create Monday Timetable Slot assigned to Prof. Rajesh Kulkarni
    const existingSlot = await prisma.timetableSlot.findFirst({
      where: {
        divisionId: division.id,
        subjectId: subject.id,
        facultyId: faculty.id,
        dayOfWeek: 'Monday',
      },
    })

    if (!existingSlot) {
      await prisma.timetableSlot.create({
        data: {
          divisionId: division.id,
          subjectId: subject.id,
          facultyId: faculty.id,
          dayOfWeek: 'Monday',
          startTime: sub.startTime,
          endTime: sub.endTime,
          roomNumber: sub.roomNumber,
        },
      })
      console.log(`Created Monday Timetable Slot for ${subject.name} (${sub.startTime} - ${sub.endTime})`)
    }

    // Seed realistic channel messages if channel is empty
    const existingMsgCount = await prisma.message.count({
      where: { channelId: channel.id },
    })

    if (existingMsgCount === 0) {
      if (sub.code === 'CS501') {
        await prisma.message.createMany({
          data: [
            {
              content: "Lab 4 assignment is due this Friday by 11:59 PM. Please ensure your Banker's Algorithm test vectors and resource allocation graphs are properly documented.",
              channelId: channel.id,
              senderId: faculty.id,
              createdAt: new Date(Date.now() - 3600000 * 2), // 2 hours ago
            },
            {
              content: 'Noted sir, will submit the sync report along with the execution screenshots.',
              channelId: channel.id,
              senderId: student.id,
              createdAt: new Date(Date.now() - 3600000 * 1), // 1 hour ago
            },
            {
              content: "Deadlock avoidance reference slides have been updated with sample matrix calculations on Moodle.",
              channelId: channel.id,
              senderId: faculty.id,
              createdAt: new Date(Date.now() - 1800000), // 30 mins ago
            },
          ],
        })
        console.log(`Seeded messages for #${channel.name}`)
      } else if (sub.code === 'CS502') {
        await prisma.message.createMany({
          data: [
            {
              content: "Today's Hall 304 session will cover B+ Tree indexing and Strict 2PL concurrency protocols. Bring your laptops with PostgreSQL configured.",
              channelId: channel.id,
              senderId: faculty.id,
              createdAt: new Date(Date.now() - 3600000 * 3),
            },
            {
              content: 'Sir, will the practice problems for transaction isolation levels be tested in the mid-terms?',
              channelId: channel.id,
              senderId: student.id,
              createdAt: new Date(Date.now() - 3600000 * 2),
            },
            {
              content: 'Yes, expect questions on serializability, conflict serializability, and phantom reads.',
              channelId: channel.id,
              senderId: faculty.id,
              createdAt: new Date(Date.now() - 3600000 * 1),
            },
          ],
        })
        console.log(`Seeded messages for #${channel.name}`)
      } else if (sub.code === 'CS503') {
        await prisma.message.createMany({
          data: [
            {
              content: 'Wireshark packet capture lab reports for TCP 3-way handshake analysis are due on Monday.',
              channelId: channel.id,
              senderId: faculty.id,
              createdAt: new Date(Date.now() - 3600000 * 4),
            },
            {
              content: 'Submitted our group capture pcap trace on the portal. Thanks sir.',
              channelId: channel.id,
              senderId: student.id,
              createdAt: new Date(Date.now() - 3600000 * 2),
            },
          ],
        })
        console.log(`Seeded messages for #${channel.name}`)
      }
    }
  }

  // 8. Seed realistic AttendanceRecord entries for Aditya Sharma
  console.log('Seeding Attendance Records for Aditya Sharma...')
  await prisma.attendanceRecord.deleteMany({
    where: { studentId: student.id },
  })

  const slots = await prisma.timetableSlot.findMany({
    where: { divisionId: division.id },
    include: { subject: true },
  })

  // Date sequence spanning past 3-4 weeks
  const lectureDates = [
    new Date('2024-09-16T09:00:00Z'),
    new Date('2024-09-18T09:00:00Z'),
    new Date('2024-09-23T09:00:00Z'),
    new Date('2024-09-25T09:00:00Z'),
    new Date('2024-09-30T09:00:00Z'),
    new Date('2024-10-07T09:00:00Z'),
    new Date('2024-10-14T09:00:00Z'),
    new Date('2024-10-21T09:00:00Z'),
  ]

  for (const slot of slots) {
    for (let i = 0; i < lectureDates.length; i++) {
      const date = lectureDates[i]
      let status: AttendanceStatus = AttendanceStatus.PRESENT

      // Specific absences to achieve realistic subject percentages
      if (slot.subject.code === 'CS501' && i === 5) {
        // OS: 1 absent (Oct 07) -> 7/8 = 87.5%
        status = AttendanceStatus.ABSENT
      } else if (slot.subject.code === 'CS502' && i === 2) {
        // DBMS: 1 absent (Sep 23) -> 7/8 = 87.5%
        status = AttendanceStatus.ABSENT
      } else if (slot.subject.code === 'CS503' && (i === 4 || i === 6)) {
        // CN: 2 absent (Sep 30, Oct 14) -> 6/8 = 75%
        status = AttendanceStatus.ABSENT
      }

      await prisma.attendanceRecord.create({
        data: {
          studentId: student.id,
          timetableSlotId: slot.id,
          date,
          status,
          durationMinutes: 60,
        },
      })
    }
    console.log(`Seeded 8 attendance records for ${slot.subject.name}`)
  }

  // 9. Seed Course Assignments & Submissions
  console.log('Seeding Course Assignments...')
  const osSubject = await prisma.subject.findUnique({ where: { code: 'CS501' } })
  const dbmsSubject = await prisma.subject.findUnique({ where: { code: 'CS502' } })
  const cnSubject = await prisma.subject.findUnique({ where: { code: 'CS503' } })

  if (osSubject && dbmsSubject && cnSubject) {
    const asg1 = await prisma.assignment.upsert({
      where: { id: 'asg-os-bankers' },
      update: {},
      create: {
        id: 'asg-os-bankers',
        title: "Banker's Algorithm & Deadlock Prevention",
        description: "Implement resource-allocation state vectors and safety matrix algorithm in C/C++.",
        subjectId: osSubject.id,
        dueDate: new Date(Date.now() + 86400000 * 2), // 2 days from now (Friday)
      },
    })

    const asg2 = await prisma.assignment.upsert({
      where: { id: 'asg-dbms-btree' },
      update: {},
      create: {
        id: 'asg-dbms-btree',
        title: 'B+ Tree Indexing & Transaction Log Analysis',
        description: 'Analyze query performance differences with clustered vs unclustered B+ Tree indexes in PostgreSQL.',
        subjectId: dbmsSubject.id,
        dueDate: new Date(Date.now() + 86400000 * 5),
      },
    })

    const asg3 = await prisma.assignment.upsert({
      where: { id: 'asg-cn-wireshark' },
      update: {},
      create: {
        id: 'asg-cn-wireshark',
        title: 'TCP 3-Way Handshake Wireshark Report',
        description: 'Capture SYN, SYN-ACK, and ACK packet traces and document window size scaling.',
        subjectId: cnSubject.id,
        dueDate: new Date(Date.now() + 86400000 * 7),
      },
    })

    // Seed submissions
    await prisma.assignmentSubmission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId: asg3.id,
          studentId: student.id,
        },
      },
      update: {},
      create: {
        assignmentId: asg3.id,
        studentId: student.id,
        fileUrl: 'CN_Lab5_Wireshark_Aditya_22110482.pcapng',
        grade: 'A',
      },
    })

    await prisma.assignmentSubmission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId: asg1.id,
          studentId: student2.id,
        },
      },
      update: {},
      create: {
        assignmentId: asg1.id,
        studentId: student2.id,
        fileUrl: 'OS_Bankers_Sneha_Roll42.c',
        grade: 'A+',
      },
    })

    await prisma.assignmentSubmission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId: asg2.id,
          studentId: student3.id,
        },
      },
      update: {},
      create: {
        assignmentId: asg2.id,
        studentId: student3.id,
        fileUrl: 'DBMS_BTree_Rohan_Roll51.pdf',
        grade: null,
      },
    })
    console.log('Seeded Course Assignments and student submissions')
  }

  // 10. Seed Division Cohort Group (#te-comp-div-a)
  console.log('Seeding Division Cohort Group...')
  const divisionChannel = await prisma.channel.upsert({
    where: { id: 'channel-te-comp-div-a' },
    update: {},
    create: {
      id: 'channel-te-comp-div-a',
      name: 'te-comp-div-a',
      type: ChannelType.DIVISION_CHAT,
      communityId: community.id,
    },
  })
  console.log('Created Division Channel: #' + divisionChannel.name)

  const divMsgCount = await prisma.message.count({
    where: { channelId: divisionChannel.id },
  })

  if (divMsgCount === 0) {
    await prisma.message.createMany({
      data: [
        {
          content: 'Good morning Division A. Please review the updated syllabus for mid-terms posted in the departmental repository. Lab 4 test cases are also attached.',
          fileUrl: 'Unit3_Midterm_Syllabus_DivA.pdf',
          channelId: divisionChannel.id,
          senderId: faculty.id,
          createdAt: new Date(Date.now() - 3600000 * 6),
        },
        {
          content: 'Thank you sir! Is the submission deadline extended for the deadlock lab?',
          channelId: divisionChannel.id,
          senderId: student2.id,
          createdAt: new Date(Date.now() - 3600000 * 5),
        },
        {
          content: "Sir, will the practical exam cover the Banker's Algorithm memory simulation or only theoretical matrices?",
          channelId: divisionChannel.id,
          senderId: student.id,
          createdAt: new Date(Date.now() - 3600000 * 4),
        },
        {
          content: 'Both practical simulation code and theoretical matrix calculations will be evaluated.',
          channelId: divisionChannel.id,
          senderId: faculty.id,
          createdAt: new Date(Date.now() - 3600000 * 3),
        },
        {
          content: 'Sharing the reference test vectors provided in today tutorial.',
          fileUrl: 'Bankers_Test_Vectors_DivA.xlsx',
          channelId: divisionChannel.id,
          senderId: student3.id,
          createdAt: new Date(Date.now() - 3600000 * 2),
        },
      ],
    })
    console.log('Seeded division cohort messages for #' + divisionChannel.name)
  }

  // 11. Seed 1-on-1 Direct Messages between Aditya Sharma & Prof. Rajesh Kulkarni
  console.log('Seeding Direct Messages between Aditya and Prof. Rajesh Kulkarni...')
  const existingDmCount = await prisma.message.count({
    where: {
      OR: [
        { senderId: student.id, directRecipientId: faculty.id },
        { senderId: faculty.id, directRecipientId: student.id },
      ],
    },
  })

  if (existingDmCount === 0) {
    await prisma.message.createMany({
      data: [
        {
          content: "Hello Prof. Kulkarni, I had a doubt regarding the safety state verification in Banker's Algorithm when Need <= Work. Could I discuss this after today's lab?",
          senderId: student.id,
          directRecipientId: faculty.id,
          createdAt: new Date(Date.now() - 3600000 * 4),
        },
        {
          content: 'Hello Aditya. Yes, the Work vector updates iteratively with Allocated resources upon safe sequence detection. Drop by my cabin (Cabin 302, 3rd Floor) at 3:30 PM today or reach out here.',
          fileUrl: 'Banker_Algorithm_Edge_Cases_Notes.pdf',
          senderId: faculty.id,
          directRecipientId: student.id,
          createdAt: new Date(Date.now() - 3600000 * 3),
        },
        {
          content: 'Understood sir! I will visit at 3:30 PM with my implementation draft. Thank you!',
          senderId: student.id,
          directRecipientId: faculty.id,
          createdAt: new Date(Date.now() - 3600000 * 2),
        },
        {
          content: 'Great. Make sure to review the attached notes beforehand.',
          senderId: faculty.id,
          directRecipientId: student.id,
          createdAt: new Date(Date.now() - 3600000 * 1),
        },
      ],
    })
    console.log('Seeded 1-on-1 Direct Messages between Aditya & Prof. Kulkarni')
  }

  // 12. Update Aditya Sharma's Assignment Submissions with Grades & Rich Feedback
  if (osSubject && cnSubject) {
    const asg1 = await prisma.assignment.findUnique({ where: { id: 'asg-os-bankers' } })
    const asg3 = await prisma.assignment.findUnique({ where: { id: 'asg-cn-wireshark' } })

    if (asg1) {
      await prisma.assignmentSubmission.upsert({
        where: {
          assignmentId_studentId: {
            assignmentId: asg1.id,
            studentId: student.id,
          },
        },
        update: {
          fileUrl: 'OS_Bankers_AdityaSharma_22110482.c',
          grade: 'A+ (95%)',
          feedback: 'Excellent implementation of the Banker safety check algorithm and deadlock avoidance state vectors. Clean memory handling, modular code structure, and accurate edge case testing for multiple resource allocations.',
          feedbackDate: new Date(Date.now() - 86400000 * 1),
        },
        create: {
          assignmentId: asg1.id,
          studentId: student.id,
          fileUrl: 'OS_Bankers_AdityaSharma_22110482.c',
          grade: 'A+ (95%)',
          feedback: 'Excellent implementation of the Banker safety check algorithm and deadlock avoidance state vectors. Clean memory handling, modular code structure, and accurate edge case testing for multiple resource allocations.',
          feedbackDate: new Date(Date.now() - 86400000 * 1),
        },
      })
    }

    if (asg3) {
      await prisma.assignmentSubmission.upsert({
        where: {
          assignmentId_studentId: {
            assignmentId: asg3.id,
            studentId: student.id,
          },
        },
        update: {
          fileUrl: 'CN_Lab5_Wireshark_Aditya_22110482.pcapng',
          grade: 'A (88%)',
          feedback: 'Accurate packet trace analysis and well-documented TCP 3-way handshake sequences. Well identified TCP sequence numbers, round trip time (RTT) estimations, and sliding window scaling factors.',
          feedbackDate: new Date(Date.now() - 86400000 * 3),
        },
        create: {
          assignmentId: asg3.id,
          studentId: student.id,
          fileUrl: 'CN_Lab5_Wireshark_Aditya_22110482.pcapng',
          grade: 'A (88%)',
          feedback: 'Accurate packet trace analysis and well-documented TCP 3-way handshake sequences. Well identified TCP sequence numbers, round trip time (RTT) estimations, and sliding window scaling factors.',
          feedbackDate: new Date(Date.now() - 86400000 * 3),
        },
      })
    }
    console.log('Updated Aditya Sharma assignment grades and instructor feedback')
  }

  // 13. Seed Realistic Course Materials & Resources for Prof. Rajesh Kulkarni
  console.log('Seeding Course Materials & Resources...')
  if (osSubject && dbmsSubject && cnSubject) {
    const materialsData = [
      {
        id: 'mat-os-bankers',
        title: "Lecture 04: Deadlock Avoidance & Banker's Algorithm.pdf",
        description: 'Comprehensive lecture slides covering Resource Allocation Graphs, safe sequence detection, and multi-resource matrices.',
        fileUrl: "Lecture_04_Deadlock_Bankers_Algorithm.pdf",
        fileType: 'PDF',
        fileSize: '3.4 MB',
        subjectId: osSubject.id,
        uploadedById: faculty.id,
      },
      {
        id: 'mat-dbms-btree',
        title: 'Unit 3: B+ Tree Indexing & Transaction Log Strategies.pptx',
        description: 'Presentation deck exploring clustered vs unclustered indexing, disk page fill factors, and write-ahead logging (WAL).',
        fileUrl: 'Unit_3_BTree_Indexing_Transaction_Logs.pptx',
        fileType: 'PPT',
        fileSize: '6.1 MB',
        subjectId: dbmsSubject.id,
        uploadedById: faculty.id,
      },
      {
        id: 'mat-cn-wireshark',
        title: 'Lab Manual: Wireshark Packet Sniffing & TCP Handshake.pdf',
        description: 'Laboratory guide for capturing SYN, SYN-ACK, ACK frames, computing RTT, and inspecting window scale options.',
        fileUrl: 'Lab_Manual_Wireshark_TCP_Handshake.pdf',
        fileType: 'PDF',
        fileSize: '2.8 MB',
        subjectId: cnSubject.id,
        uploadedById: faculty.id,
      },
    ]

    for (const mat of materialsData) {
      await prisma.courseMaterial.upsert({
        where: { id: mat.id },
        update: {
          title: mat.title,
          description: mat.description,
          fileUrl: mat.fileUrl,
          fileType: mat.fileType,
          fileSize: mat.fileSize,
          subjectId: mat.subjectId,
          uploadedById: mat.uploadedById,
        },
        create: {
          id: mat.id,
          title: mat.title,
          description: mat.description,
          fileUrl: mat.fileUrl,
          fileType: mat.fileType,
          fileSize: mat.fileSize,
          subjectId: mat.subjectId,
          uploadedById: mat.uploadedById,
        },
      })
    }
    console.log('Seeded 3 realistic Course Materials for Prof. Rajesh Kulkarni')
  }

  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
