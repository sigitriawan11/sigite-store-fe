"use client"

import { Logo } from "@/assets"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Input } from "antd"
import Link from "next/link"
import { motion } from "framer-motion"
import { BiLogIn, BiSearch, BiGridAlt, BiLogOut, BiChevronDown } from "react-icons/bi"
import LordIcon from "../atom/LordIcon"
import { useLayoutStore } from "@/store/layout"
import { useAuthStore } from "@/store/auth"
import { useState, useRef, useEffect } from "react"

const HeaderProfile = () => {
    const router = useRouter()
    const { user, logout } = useAuthStore()
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener("mousedown", onClick)
        return () => document.removeEventListener("mousedown", onClick)
    }, [])

    const name = String(user?.display_name || user?.email || "Account")
    const initial = name.charAt(0).toUpperCase()

    const handleLogout = async () => {
        setOpen(false)
        await logout()
        router.push("/")
    }

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-white/10 transition-colors"
            >
                <span className="w-8 h-8 shrink-0 rounded-full bg-[#5E7AC4]/30 border border-[#5E7AC4]/40 flex items-center justify-center text-sm font-bold text-white">
                    {initial}
                </span>
                <span className="text-white text-sm truncate max-w-[120px] hidden sm:block">{name}</span>
                <BiChevronDown className="text-white/70 shrink-0" />
            </button>
            {open && (
                <div className="absolute right-0 mt-2 w-48 bg-[#0e1324] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                    <button
                        onClick={() => { setOpen(false); router.push("/admin/dashboard") }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 transition-colors"
                    >
                        <BiGridAlt size={16} /> Dashboard
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 transition-colors border-t border-white/10"
                    >
                        <BiLogOut size={16} /> Logout
                    </button>
                </div>
            )}
        </div>
    )
}

const HeaderComp = () => {
    const router = useRouter()
    const { menu, setMenu } = useLayoutStore()
    const { isAuthenticated } = useAuthStore()

    return (
        <div className="sticky top-0 z-50 w-full backdrop-blur-md bg-black/30 border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="flex items-center gap-2 sm:gap-3">
                    <Link href="/" className="shrink-0">
                        <motion.div
                            className="relative w-9 h-9 sm:w-12 sm:h-12"
                            animate={{
                                x: [0, 10, -10, 0, 0],
                                rotate: [0, 0, 0, 360, 360],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut",
                                times: [0, 0.2, 0.4, 0.7, 1],
                            }}
                        >
                            <Image
                                src={Logo.src}
                                alt="Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </motion.div>
                    </Link>

                    <div className="flex-1 min-w-0">
                        <Input
                            size="large"
                            prefix={<BiSearch className="text-gray-400" />}
                            placeholder="Search games..."
                            className="rounded-full! bg-transparent!"
                        />
                    </div>

                    <div className="shrink-0">
                        {isAuthenticated ? (
                            <HeaderProfile />
                        ) : (
                            <button
                                onClick={() => router.push('/auth/login')}
                                className="flex items-center gap-1.5 text-white px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <BiLogIn size={18} />
                                <span className="hidden sm:inline text-sm">Login</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-6 mt-3">
                    <LordIcon
                        src="https://cdn.lordicon.com/yycecovd.json"
                        label="Top Up"
                        defaultColor="primary:#848484"
                        activeColor="primary:#FD5C5C"
                        hoverColor="primary:#c7c7c7"
                        defaultTextColor="#848484"
                        activeTextColor="#FD5C5C"
                        hoverTextColor="#c7c7c7"
                        isActive={menu === "topup"}
                        onActivate={() => setMenu("topup")}
                        onClick={() => router.push('/')}
                    />
                    <LordIcon
                        src="https://cdn.lordicon.com/zmvzumis.json"
                        label="Check Order"
                        defaultColor="primary:#848484"
                        activeColor="primary:#FD5C5C"
                        hoverColor="primary:#c7c7c7"
                        defaultTextColor="#848484"
                        activeTextColor="#FD5C5C"
                        hoverTextColor="#c7c7c7"
                        isActive={menu === "check_order"}
                        onActivate={() => setMenu("check_order")}
                        onClick={() => router.push('/order')}
                    />
                </div>
            </div>
        </div>
    )
}

export default HeaderComp