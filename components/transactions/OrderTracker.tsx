"use client"

import { useState } from "react"
import { Input, Button } from "antd"
import { useRouter } from "next/navigation"
import { BiSearch, BiReceipt, BiSolidZap, BiLockAlt, BiRocket } from "react-icons/bi"
import { motion } from "framer-motion"
import { useNotification } from "../provider/NotificationProvider"

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const, staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const } },
}

const OrderTracker = () => {
  const [value, setValue] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const notification = useNotification()

  const handleSubmit = async () => {
    const trimmed = value.trim()
    if (!trimmed) {
      notification.warning({
        title: 'Warning',
        description: "Please enter an invoice or WhatsApp number"
      })
      return
    }
    setLoading(true)
    
    await new Promise((r) => setTimeout(r, 400))
    router.push(`/invoice/${encodeURIComponent(trimmed)}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit()
  }

  return (
    <motion.div
      className="relative min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-5"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
       
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative w-full max-w-2xl mx-auto">
         
        <motion.div
          variants={itemVariants}
          className="relative rounded-3xl border border-gray-700/60 p-8 sm:p-12
            bg-(--color-4)/30 backdrop-blur-xl shadow-2xl shadow-blue-900/10
            before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-b
            before:from-white/[0.04] before:to-transparent before:pointer-events-none"
        >
           
          <motion.div
            variants={itemVariants}
            className="flex justify-center mb-6"
          >
            <div className="relative">
               
              <div className="absolute -inset-3 bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-blue-600/30 rounded-2xl blur-xl" />
              <div
                className="relative w-14 h-14 rounded-2xl flex items-center justify-center
                  bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25"
              >
                <BiReceipt className="text-white text-2xl" />
              </div>
            </div>
          </motion.div>

           
          <motion.div variants={itemVariants} className="flex justify-center mb-4">
            <span
              className="inline-block text-[10px] font-semibold tracking-[0.2em] uppercase
                text-red-400/80 bg-red-500/10 px-4 py-1.5 rounded-full border border-red-500/20"
            >
              TRACK INVOICE
            </span>
          </motion.div>

           
          <motion.h1
            variants={itemVariants}
            className="text-center text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-4 leading-tight"
          >
            Track Your Order Status
          </motion.h1>

           
          <motion.p
            variants={itemVariants}
            className="text-center text-sm sm:text-base text-gray-400 max-w-lg mx-auto mb-8 leading-relaxed"
          >
            Enter your invoice number or WhatsApp number used during checkout.
            We&apos;ll display the latest order information in real time.
          </motion.p>

           
          <motion.div variants={itemVariants} className="space-y-3 max-w-lg mx-auto">
            <div className="relative">
              <BiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg z-10" />
              <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Invoice Number or WhatsApp Number"
                size="large"
                className="!h-14 !rounded-full !bg-black/40 !border !border-gray-700/60 !pl-12 !pr-4
                  !text-white !text-sm placeholder:!text-gray-500
                  hover:!border-blue-500/40 focus:!border-blue-500/60 focus:!shadow-[0_0_0_2px_rgba(59,130,246,0.15)]
                  !transition-all !duration-300"
              />
            </div>

            <Button
              type="primary"
              onClick={handleSubmit}
              loading={loading}
              icon={<BiSearch className="text-base" />}
              className="!w-full !h-14 !rounded-full !text-base !font-semibold !border-0
                !bg-gradient-to-r !from-blue-600 !to-purple-600
                hover:!from-blue-500 hover:!to-purple-500
                !shadow-lg !shadow-blue-600/25 hover:!shadow-blue-500/40
                !transition-all !duration-300 hover:!scale-[1.02] active:!scale-[0.98]
                !flex !items-center !justify-center !gap-2"
            >
              {!loading && "Check Now"}
            </Button>
          </motion.div>

           
          <motion.p
            variants={itemVariants}
            className="text-center text-xs text-gray-600 mt-4 font-mono"
          >
            Example: TRX-20240517-XXXX or 628123456789
          </motion.p>

        </motion.div>
      </div>
    </motion.div>
  )
}

export default OrderTracker