'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { LogOut, AlertTriangle, Loader2, X } from 'lucide-react'

interface SignOutConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  userName?: string
  userEmail?: string
}

export default function SignOutConfirmModal({
  isOpen,
  onClose,
  userName = 'User',
  userEmail,
}: SignOutConfirmModalProps) {
  const [mounted, setMounted] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSigningOut) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isSigningOut, onClose])

  if (!isOpen || !mounted) return null

  const handleConfirmSignOut = async () => {
    setIsSigningOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      // Direct hard redirect to ensure cookies and states are fully reset
      window.location.href = '/login'
    }
  }

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200"
        onClick={() => !isSigningOut && onClose()}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 z-10 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSigningOut}
          className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#0F172A] p-1.5 rounded-lg hover:bg-[#F1F5F9] transition-colors disabled:opacity-40 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FEF2F2] border border-[#FEE2E2] flex items-center justify-center flex-shrink-0 text-[#DC2626]">
            <LogOut className="w-6 h-6" />
          </div>

          <div className="flex-1">
            <h3 className="text-base font-bold text-[#0F172A]">
              Confirm Session Sign Out
            </h3>
            <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
              Are you sure you want to end your active session for{' '}
              <strong className="text-[#0F172A]">{userName}</strong>
              {userEmail ? ` (${userEmail})` : ''}?
            </p>

            <div className="mt-3 p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] flex items-center gap-2 text-[11px] text-[#991B1B]">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-[#EF4444]" />
              <span>You will need to enter your institutional credentials to log in again.</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-2.5 pt-3 border-t border-[#F1F5F9]">
          <button
            type="button"
            onClick={onClose}
            disabled={isSigningOut}
            className="px-4 py-2 rounded-lg border border-[#CBD5E1] bg-white text-xs font-semibold text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmSignOut}
            disabled={isSigningOut}
            className="px-4 py-2 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold inline-flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSigningOut ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Signing out...</span>
              </>
            ) : (
              <span>Sign Out</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent
}
