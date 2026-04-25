"use client"

import { FieldConfig, FormApp } from "@/components/atom/Form"
import { useAuthStore } from "@/store/auth";
import { Form } from "antd";
import Link from "next/link";
import { BiPhone, BiUserCircle } from "react-icons/bi"
import { LuUserPlus } from "react-icons/lu";
import { MdEmail } from "react-icons/md";
import { TbLockPassword } from "react-icons/tb"
import { useNotification } from "../provider/NotificationProvider";

const RegisterComp = () => {
    const [form] = Form.useForm()
    const { register, loading, error } = useAuthStore()
    const notif = useNotification()

    const handleSubmit = async (values:any) => {
        const result = await register(values)

        if(result){
            form.resetFields()
            notif.success({
                title: 'Success',
                description: result
            })
        } else {
            notif.info({
                title: 'Info',
                description: error
            })
        }
    }

    const config: FieldConfig[][] = [
        [
            {
                col: 24,
                input: {
                    label: "Fullname",
                    key: "name",
                    suffix: <BiUserCircle />,
                    placeholder: "Enter your fullname",
                    rules: [{ required: true, message: "Fullname is required" }],
                },
            },
            {
                col: 24,
                input: {
                    label: "Email",
                    key: "email",
                    suffix: <MdEmail />,
                    placeholder: "Enter your email",
                    type: "email",
                    rules: [{ required: true, message: "Email is required" }],
                },
            },
            {
                col: 24,
                input: {
                    label: "Phone Number",
                    key: "phone_number",
                    suffix: <BiPhone />,
                    placeholder: "Enter your phone, ex: 6289 / 089",
                    type: "number",
                    rules: [{ required: true, message: "Phone number is required" }],
                },
            },
            {
                col: 24,
                input: {
                    label: "Password",
                    key: "password",
                    suffix: <TbLockPassword />,
                    type: "password",
                    placeholder: "Enter your password",
                    rules: [{ required: true, message: "Password is required" }],
                },
            },
            {
                col: 24,
                input: {
                    label: "Confirm Password",
                    key: "confirm_password",
                    suffix: <TbLockPassword />,
                    type: "password",
                    placeholder: "Enter your password",
                    rules: [
                        { required: true, message: "Confirm password is required" },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('The new password that you entered do not match!'));
                            },
                        })
                    ],
                },
            },
            {
                col: 24,
                switch: {
                    label: 'Terms & Conditions',
                    key: 'terms',
                    defaultValue: false,
                    rules: [
                        {
                            validator: (_, value) =>
                                value === true
                                    ? Promise.resolve()
                                    : Promise.reject("You must accept the terms & conditions"),
                        },
                    ],
                    description: (
                        <span className="text-gray-400">Accept out <Link href="/terms" target="_blank" className="text-(--color-2)! cursor-pointer font-semibold hover:underline!">Terms Of Service</Link> and <Link href="/privacy" target="_blank" className="text-(--color-2)! cursor-pointer font-semibold hover:underline!">Privacy Policy</Link></span>
                    )
                }
            },
            {
                col: 15,
                text: {
                    key: 'login',
                    children: (
                        <span className="text-gray-400">Have account ? <Link href="/auth/login" className="text-(--color-2)! cursor-pointer font-semibold hover:underline!">Login</Link></span>
                    )
                }
            },
            {
                col: 24,
                button: {
                    icon: <LuUserPlus />,
                    key: "register",
                    label: "Sign Up",
                    htmlType: "submit",
                    loading: loading.register,
                    size: "large",
                    className: "!bg-gradient-to-r !from-(--color-2) !to-(--color-1) !text-white hover:!bg-gradient-to-r hover:!from-(--color-1) hover:!to-(--color-2) !transition !duration-1000 focus:!border-2 focus:!border-(--color-2)"
                }
            },
        ],

    ]

    return (
        <>
            <h1 className="text-xl font-bold text-gray-900 mb-5 leading-tight" style={{ fontFamily: "Georgia, serif" }}>
                Register Form
            </h1>

            <FormApp
                config={config}
                form={form}
                onFinish={handleSubmit}
            />
        </>
    )
}

export default RegisterComp