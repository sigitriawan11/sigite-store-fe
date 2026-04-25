"use client"
import { div, span } from "framer-motion/client"
import { useState } from "react"

interface LordIconProps {
    src: string
    label: string
    defaultColor?: string
    hoverColor?: string
    activeColor?: string
    defaultTextColor?: string
    hoverTextColor?: string
    activeTextColor?: string
    isActive?: boolean
    onActivate?: () => void
    onClick?: () => void
}

const LordIcon = ({
    src,
    label,
    defaultColor = "primary:",
    hoverColor,
    activeColor = "primary:#1677ff",
    defaultTextColor = "",
    hoverTextColor,
    activeTextColor = "#1677ff",
    isActive = false,
    onActivate,
    onClick,
}: LordIconProps) => {
    const [hovered, setHovered] = useState(false)

    const iconColor = isActive
        ? activeColor
        : hovered
            ? (hoverColor ?? activeColor)
            : defaultColor

    const textColor = isActive
        ? activeTextColor
        : hovered
            ? (hoverTextColor ?? activeTextColor)
            : defaultTextColor

    return (
        <div className="w-full ">
            <div
                className="flex items-center gap-x-3 cursor-pointer select-none justify-center"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onClick={() => {
                    onActivate?.()
                    onClick?.()
                }}
            >
                <lord-icon
                    key={hovered ? "hover" : "idle"}
                    src={src}
                    trigger={hovered ? "loop" : "hover"}
                    colors={iconColor}
                    style={{ width: "24px", height: "24px", pointerEvents: "none" }}
                />
                <h3 className="transition-colors duration-200" style={{ color: textColor }}>
                    {label}
                </h3>

            </div>
            {isActive && (
                <div
                    className="mt-1 h-0.5 rounded-full transition-all duration-200"
                    style={{ backgroundColor: activeTextColor }}
                />
            )}
        </div>
    )
}

export default LordIcon