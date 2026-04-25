import { Logo } from "@/assets"
import Image from "next/image"
import { FieldConfig, FormApp } from "../atom/Form"
import { useRouter } from "next/navigation"
import { Form } from "antd"
import Link from "next/link"
import { motion } from "framer-motion"
import { BiLogIn, BiSearch } from "react-icons/bi"
import LordIcon from "../atom/LordIcon"
import { useLayoutStore } from "@/store/layout"
const HeaderComp = () => {
    const router = useRouter()
    const [form_header] = Form.useForm()
    const { menu, setMenu } = useLayoutStore()

    const config_header: FieldConfig[][] = [
        [
            {
                col: 2,
                other: (
                    <Link href="/" className="relative block w-full h-12">
                        <motion.div
                            className="relative w-full h-12"
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
                )
            },
            {
                col: 20,
                autocomplete: {
                    prefix: <BiSearch />,
                    key: 'search',
                    className: 'rounded-full! bg-transparent!',
                    options: [],
                    size: 'large'
                }
            },
            {
                col: 2,
                button: {
                    label: 'Login',
                    type: 'text',
                    key: 'login',
                    className: 'text-white!',
                    icon: <BiLogIn />,
                    size: 'large',
                    onClick: () => router.push('/auth/login')
                }
            },
        ]
    ]

    const config_header_2: FieldConfig[][] = [
        [
            {
                col: 2,
                other: (
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
                )
            },
            {
                col: 3,
                other: (
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
                )
            }
        ]
    ]
    return (
        <div className="sticky top-0 z-50 w-full backdrop-blur-md bg-black/30 border-b border-white/10">
            <div className="max-w-7xl mx-auto p-4">
                <FormApp
                    config={config_header}
                    form={form_header}
                />
                <div className="mt-5"></div>
                <FormApp
                    config={config_header_2}
                    form={form_header}
                />
            </div>
        </div>
    )
}

export default HeaderComp