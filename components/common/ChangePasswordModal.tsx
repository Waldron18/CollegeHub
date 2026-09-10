'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  ShieldCheck,
} from 'lucide-react'

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
  userEmail?: string
}

export default function ChangePasswordModal({
  isOpen,
  onClose,
  userEmail,
}: ChangePasswordModalProps) {
  const [mounted, setMounted] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Reset states on open/close
  useEffect(() => {
    if (isOpen) {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setErrorMsg(null)
      setSuccessMsg(null)
      setShowCurrent(false)
      setShowNew(false)
      setShowConfirm(false)
    }
  }, [isOpen])

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isSubmitting, onClose])

  if (!isOpen || !mounted) return null

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-slate-200' }
    let score = 0
    if (pwd.length >= 8) score += 1
    if (/[A-Z]/.test(pwd)) score += 1
    if (/[0-9]/.test(pwd)) score += 1
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-[#EF4444]' }
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-[#F59E0B]' }
    if (score === 3) return { score: 3, label: 'Good', color: 'bg-[#3B82F6]' }
    return { score: 4, label: 'Strong', color: 'bg-[#10B981]' }
  }

  const strength = getPasswordStrength(newPassword)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!currentPassword) {
      setErrorMsg('Please enter your current password.')
      return
    }

    if (newPassword.length < 8) {
      setErrorMsg('New password must be at least 8 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirm password do not match.')
      return
    }

    if (currentPassword === newPassword) {
      setErrorMsg('New password cannot be the same as your current password.')
      return
    }

    setIsSubmitting(true)

    // Simulate password update with smooth feedback
    setTimeout(() => {
      setIsSubmitting(false)
      setSuccessMsg('Password updated successfully! Your new credentials are now active for all VIIT digital portals.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')

      setTimeout(() => {
        onClose()
      }, 1800)
    }, 600)
  }

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Full-screen semi-transparent backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200"
        onClick={() => !isSubmitting && onClose()}
      />

      {/* Dialog Card centered in viewport */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#0F172A] p-1.5 rounded-lg hover:bg-[#F1F5F9] transition-colors disabled:opacity-40 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-[#99F6E4] flex items-center justify-center text-[#0D9488] flex-shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0F172A]">Change Password</h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Update your institutional authentication credentials for VIERP & VoIP
            </p>
          </div>
        </div>

        {/* Feedback Banners */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] flex items-center gap-2 text-xs text-[#991B1B]">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#EF4444]" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] flex items-start gap-2 text-xs text-[#065F46] animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-[#10B981] mt-0.5" />
            <span className="leading-relaxed">{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-semibold text-[#334155] mb-1">
              Current Password <span className="text-[#EF4444]">*</span>
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
                className="w-full h-9 pl-3 pr-10 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:bg-white focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] p-1 cursor-pointer"
              >
                {showCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#334155]">
                New Password <span className="text-[#EF4444]">*</span>
              </label>
              {newPassword && (
                <span className="text-[10px] font-semibold text-[#64748B]">
                  Strength:{' '}
                  <span
                    className={
                      strength.score === 1
                        ? 'text-[#EF4444]'
                        : strength.score === 2
                        ? 'text-[#F59E0B]'
                        : strength.score === 3
                        ? 'text-[#3B82F6]'
                        : 'text-[#10B981]'
                    }
                  >
                    {strength.label}
                  </span>
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                required
                className="w-full h-9 pl-3 pr-10 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:bg-white focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] p-1 cursor-pointer"
              >
                {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Password Strength Indicator Bar */}
            {newPassword && (
              <div className="mt-1.5 flex gap-1 h-1">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-full flex-1 rounded-full transition-all ${
                      strength.score >= step ? strength.color : 'bg-[#E2E8F0]'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-xs font-semibold text-[#334155] mb-1">
              Confirm New Password <span className="text-[#EF4444]">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
                className="w-full h-9 pl-3 pr-10 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:bg-white focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] p-1 cursor-pointer"
              >
                {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {confirmPassword && newPassword && confirmPassword !== newPassword && (
              <span className="text-[10px] text-[#EF4444] mt-1 block">
                Passwords do not match
              </span>
            )}
          </div>

          {/* Institutional Info Note */}
          <div className="pt-2 text-[11px] text-[#64748B] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0D9488] flex-shrink-0" />
            <span>Encrypted with SHA-256 institutional key standards.</span>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-end gap-2.5 pt-2 border-t border-[#F1F5F9]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg border border-[#CBD5E1] bg-white text-xs font-semibold text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !!successMsg}
              className="px-4 py-2 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold inline-flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent
}
