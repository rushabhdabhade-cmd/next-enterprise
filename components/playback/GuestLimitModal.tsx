"use client"

import { SignInButton, SignUpButton } from "@clerk/nextjs"
import * as Dialog from "@radix-ui/react-dialog"
import { Crown, Lock, Music2, X } from "lucide-react"
import { usePlaybackStore } from "@/store/usePlaybackStore"

export default function GuestLimitModal() {
    const { showGuestLimitModal, setGuestLimitModal } = usePlaybackStore()

    return (
        <Dialog.Root open={showGuestLimitModal} onOpenChange={setGuestLimitModal}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] animate-in fade-in duration-300" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md bg-white dark:bg-gray-950 rounded-[32px] p-8 md:p-12 shadow-2xl z-[101] animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-gray-900">
                    <Dialog.Close className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-400 hover:text-gray-950 dark:hover:text-white transition-all">
                        <X size={20} />
                    </Dialog.Close>

                    <div className="flex flex-col items-center text-center">
                        {/* Icon stack */}
                        <div className="relative mb-8">
                            <div className="w-20 h-20 bg-pink-500/10 rounded-3xl flex items-center justify-center animate-pulse">
                                <Music2 size={32} className="text-pink-500" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-950">
                                <Lock size={14} className="text-amber-950" />
                            </div>
                        </div>

                        <Dialog.Title className="text-2xl md:text-3xl font-bold tracking-tight text-gray-950 dark:text-white mb-4">
                            Enjoying the App?
                        </Dialog.Title>

                        <Dialog.Description className="text-gray-500 dark:text-gray-400 font-medium mb-8 leading-relaxed">
                            You've hit the limit for guest playback. <br />
                            <span className="text-gray-900 dark:text-white font-bold italic">Sign up now</span> to listen to unlimited songs and build your personal library!
                        </Dialog.Description>

                        <div className="w-full space-y-3">
                            <SignUpButton mode="modal">
                                <button className="w-full py-4 bg-gray-950 dark:bg-white text-white dark:text-gray-950 font-bold rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-gray-950/20 dark:shadow-none">
                                    <Crown size={18} fill="currentColor" />
                                    Get Unlimited Access
                                </button>
                            </SignUpButton>

                            <SignInButton mode="modal">
                                <button className="w-full py-4 bg-gray-100 dark:bg-gray-900 text-gray-950 dark:text-white font-bold rounded-2xl border border-gray-200 dark:border-gray-800 hover:bg-gray-200 dark:hover:bg-gray-800 transition-all">
                                    Sign In
                                </button>
                            </SignInButton>
                        </div>

                        <p className="mt-8 text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                            Join 10,000+ Music Lovers
                        </p>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}
