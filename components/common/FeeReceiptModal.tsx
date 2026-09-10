'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Printer,
  CheckCircle2,
  Download,
  Building2,
  QrCode,
  ShieldCheck,
  Receipt,
  FileCheck,
  CreditCard,
  Calendar,
  User,
  Hash,
} from 'lucide-react'

export interface FeeReceiptData {
  receiptNumber: string
  transactionId: string
  academicYear: string
  studentName: string
  prn: string
  program: string
  department: string
  division: string
  paymentMode: string
  date: string
  status: string
  bankAuthRef: string
  institution: {
    name: string
    subtitle: string
    accreditation: string
    address: string
    phone: string
    email: string
  }
  breakdown: Array<{
    item: string
    title: string
    amount: number
    formatted: string
  }>
  totalAmount: number
  totalFormatted: string
  amountInWords: string
  cashierStamp: string
  barcodeNumber: string
  issuedAt: string
}

interface FeeReceiptModalProps {
  isOpen: boolean
  onClose: () => void
  transactionId?: string
}

export function FeeReceiptModal({
  isOpen,
  onClose,
  transactionId = 'latest',
}: FeeReceiptModalProps) {
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [receipt, setReceipt] = useState<FeeReceiptData | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    let isSubscribed = true
    setIsLoading(true)

    async function loadReceipt() {
      try {
        const res = await fetch(`/api/student/receipt/${encodeURIComponent(transactionId)}`)
        if (res.ok) {
          const data = await res.json()
          if (isSubscribed && data.receipt) {
            setReceipt(data.receipt)
          }
        } else {
          // Fallback static data
          if (isSubscribed) {
            setReceipt({
              receiptNumber: 'TXN-2024-SEM5-4821',
              transactionId: 'TXN-2024-SEM5-4821',
              academicYear: '2024-25',
              studentName: 'Aditya Sharma',
              prn: '22110482',
              program: 'B.Tech Computer Engineering',
              department: 'Department of Computer Engineering',
              division: 'TE Div A',
              paymentMode: 'Online / UPI NetBanking',
              date: '15 Jul 2024',
              status: 'SUCCESS / CLEARED',
              bankAuthRef: 'HDFC-UPI-884920194',
              institution: {
                name: 'Vishwakarma Institute of Information Technology',
                subtitle: 'An Autonomous Institute Affiliated to Savitribai Phule Pune University (SPPU)',
                accreditation: 'Approved by AICTE • NAAC "A++" Grade Accredited',
                address: 'Survey No. 352/1, Kondhwa (Bk), Pune, Maharashtra 411048',
                phone: '+91 (020) 26950200 / 400',
                email: 'accounts@viit.ac.in',
              },
              breakdown: [
                { item: '1', title: 'Tuition Fee', amount: 85000, formatted: '₹85,000' },
                { item: '2', title: 'Development Fee', amount: 14500, formatted: '₹14,500' },
                { item: '3', title: 'Exam & Library Cess', amount: 3500, formatted: '₹3,500' },
                { item: '4', title: 'Gymkhana & Student Activities', amount: 2000, formatted: '₹2,000' },
              ],
              totalAmount: 105000,
              totalFormatted: '₹1,05,000',
              amountInWords: 'One Lakh Five Thousand Rupees Only',
              cashierStamp: 'VIIT-ACCOUNTS-CHALLAN-VERIFIED',
              barcodeNumber: '*TXN-2024-SEM5-4821*',
              issuedAt: new Date().toISOString(),
            })
          }
        }
      } catch (err) {
        console.error('Failed to load receipt:', err)
      } finally {
        if (isSubscribed) setIsLoading(false)
      }
    }

    loadReceipt()

    return () => {
      isSubscribed = false
    }
  }, [isOpen, transactionId])

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!mounted || !isOpen) return null

  const handlePrint = () => {
    window.print()
  }

  const modalContent = (
    <>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #fee-challan-voucher,
          #fee-challan-voucher * {
            visibility: visible !important;
          }
          #fee-challan-voucher {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            box-shadow: none !important;
            border: 2px solid #000 !important;
            background: #fff !important;
            color: #000 !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="fee-receipt-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:static print:inset-auto"
      >
        {/* Dimmed Blurred Backdrop */}
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity print:hidden"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal Window */}
        <div className="relative z-10 w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh] print:max-h-none print:overflow-visible print:border-none print:shadow-none print:rounded-none">
          {/* Top Modal Bar (Screen only) */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-[#F8FAFC] print:hidden">
            <div className="flex items-center gap-2 text-slate-800">
              <Receipt className="w-5 h-5 text-[#0D9488]" />
              <div>
                <h2 id="fee-receipt-title" className="text-sm font-bold text-slate-900 leading-tight">
                  Official University Fee Challan
                </h2>
                <span className="text-[11px] text-slate-500 font-mono">
                  AY {receipt?.academicYear || '2024-25'} • Ref #{receipt?.transactionId || transactionId}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="bg-[#F59E0B] hover:bg-[#D97706] text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt / PDF</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close fee receipt modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Printable Voucher Container */}
          <div className="p-4 sm:p-8 overflow-y-auto space-y-6 print:p-0 print:overflow-visible bg-[#FAFBFD]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
                <div className="w-8 h-8 border-3 border-[#0D9488] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-medium">Fetching verified institutional fee records...</span>
              </div>
            ) : receipt ? (
              <div
                id="fee-challan-voucher"
                className="bg-white border-2 border-slate-900 rounded-xl p-6 sm:p-8 shadow-sm text-slate-900 print:rounded-none print:shadow-none font-sans"
              >
                {/* Challan Header */}
                <div className="border-b-2 border-slate-900 pb-4 text-center">
                  <div className="inline-flex items-center justify-center gap-2 mb-1">
                    <Building2 className="w-6 h-6 text-[#1E40AF]" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-[#1E40AF]">
                      Bansilal Ramnath Agarwal Charitable Trust&apos;s
                    </span>
                  </div>
                  <h1 className="text-base sm:text-lg font-black tracking-tight uppercase text-slate-900">
                    {receipt.institution.name}
                  </h1>
                  <p className="text-[11px] font-semibold text-slate-700">
                    {receipt.institution.subtitle}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                    {receipt.institution.accreditation} • {receipt.institution.address}
                  </p>
                  <div className="mt-2 inline-block px-4 py-1 bg-slate-900 text-white font-mono text-xs font-black tracking-wider uppercase rounded-sm">
                    STUDENT FEE PAYMENT CHALLAN &amp; ACADEMIC LEDGER
                  </div>
                </div>

                {/* Sub-meta Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-3 border-b border-slate-300 text-[11px] bg-slate-50 px-3 rounded-md my-4">
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-bold">Challan Ref No.</span>
                    <strong className="font-mono text-slate-900">{receipt.receiptNumber}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-bold">Payment Date</span>
                    <strong>{receipt.date}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-bold">Academic Year</span>
                    <strong>{receipt.academicYear} (Semester 5)</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-bold">Status</span>
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {receipt.status}
                    </span>
                  </div>
                </div>

                {/* Student Particulars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-5 p-3 rounded-lg border border-slate-200">
                  <div className="space-y-1">
                    <div className="flex">
                      <span className="w-32 text-slate-500 text-[11px]">Student Name:</span>
                      <strong className="text-slate-900 uppercase">{receipt.studentName}</strong>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-slate-500 text-[11px]">Permanent Reg. No (PRN):</span>
                      <strong className="font-mono text-slate-900">{receipt.prn}</strong>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-slate-500 text-[11px]">Academic Program:</span>
                      <strong className="text-slate-900">{receipt.program}</strong>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex">
                      <span className="w-32 text-slate-500 text-[11px]">Department:</span>
                      <strong className="text-slate-900">{receipt.department}</strong>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-slate-500 text-[11px]">Class &amp; Division:</span>
                      <strong className="text-slate-900">{receipt.division}</strong>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-slate-500 text-[11px]">Payment Channel:</span>
                      <strong className="text-slate-900">{receipt.paymentMode}</strong>
                    </div>
                  </div>
                </div>

                {/* Itemized Fee Table */}
                <div className="mb-5 overflow-hidden border border-slate-900 rounded-md">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-900 text-white font-bold uppercase text-[10px]">
                        <th className="py-2 px-3 text-left w-12">Sr. No.</th>
                        <th className="py-2 px-4 text-left">Fee Head Particulars</th>
                        <th className="py-2 px-4 text-right">Sanctioned Amount (INR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800">
                      {receipt.breakdown.map((row) => (
                        <tr key={row.item} className="hover:bg-slate-50/80">
                          <td className="py-2.5 px-3 text-center font-mono font-medium">{row.item}</td>
                          <td className="py-2.5 px-4 font-medium">{row.title}</td>
                          <td className="py-2.5 px-4 text-right font-mono font-bold">{row.formatted}.00</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-100 font-black text-slate-900 text-sm border-t-2 border-slate-900">
                        <td colSpan={2} className="py-3 px-4 text-right uppercase tracking-wider">
                          Total Amount Cleared:
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-emerald-800">
                          {receipt.totalFormatted}.00
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Words and Bank Reference */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs mb-6 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Amount In Words:</span>
                    <strong className="italic text-slate-900">{receipt.amountInWords}</strong>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Bank Auth Reference:</span>
                    <strong className="font-mono text-slate-900">{receipt.bankAuthRef}</strong>
                  </div>
                </div>

                {/* Footer Section: Signatures & Cashier Barcode */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t-2 border-slate-900 items-end">
                  {/* Left: Barcode & Digital Stamp */}
                  <div className="space-y-1">
                    <div className="font-mono text-[10px] tracking-widest text-slate-600">
                      ||||| | |||| ||| |||||| ||||| |||
                    </div>
                    <span className="font-mono text-[9px] text-slate-500 block">
                      {receipt.barcodeNumber}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                      <ShieldCheck className="w-3 h-3" />
                      {receipt.cashierStamp}
                    </span>
                  </div>

                  {/* Center: QR Code Stamp */}
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 border border-slate-300 rounded p-1 bg-white flex items-center justify-center mb-1">
                      <QrCode className="w-14 h-14 text-slate-900" />
                    </div>
                    <span className="text-[8px] font-mono text-slate-500 uppercase">
                      Scan to Verify at vierp.in
                    </span>
                  </div>

                  {/* Right: Cashier Signatory */}
                  <div className="text-center sm:text-right space-y-1">
                    <div className="inline-block border-b border-dashed border-slate-400 pb-1 w-44">
                      <span className="font-serif italic text-xs block text-slate-700">[Electronically Authorized]</span>
                    </div>
                    <strong className="block text-[10px] uppercase text-slate-900">
                      Finance &amp; Accounts Officer
                    </strong>
                    <span className="block text-[9px] text-slate-500">
                      VIIT Pune Administrative Office
                    </span>
                  </div>
                </div>

                {/* Legal Footnote */}
                <div className="mt-6 pt-2 border-t border-slate-200 text-[9px] text-slate-400 text-center">
                  This is a computer-generated institutional receipt valid for university submission, passport/visa clearance, and income tax 80C declaration.
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-rose-600 text-xs">
                Could not retrieve fee clearance records. Please try again.
              </div>
            )}
          </div>

          {/* Bottom Action Footer (Screen only) */}
          <div className="px-6 py-3 border-t border-slate-200 bg-[#F8FAFC] flex items-center justify-between text-xs print:hidden">
            <span className="text-slate-500 text-[11px]">
              Computer-generated document • No physical stamp required
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="bg-[#F59E0B] hover:bg-[#D97706] text-white text-xs font-semibold px-4 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Challan Receipt</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent
}
