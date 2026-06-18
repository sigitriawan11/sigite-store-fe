"use client";

import Image from "next/image";
import { Form } from "antd";
import { Google } from "@/assets";
import { FieldConfig, FormApp } from "@/components/atom/Form";
import { BiUserCircle } from "react-icons/bi";
import { TbLockPassword } from "react-icons/tb";
import { LiaSignInAltSolid } from "react-icons/lia";
import { useAuthStore } from "@/store/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { AUTH_ERROR_MAP } from "@/constants/auth";
import { useNotification } from "@/components/provider/NotificationProvider";
import Link from "next/link";
import { MdEmail } from "react-icons/md";

const LoginComp = () => {
    const [form] = Form.useForm();
    const { loginProvider } = useAuthStore()
    const notif = useNotification()
    const hasHandled = useRef(false);

    const router = useRouter();
    const params = useSearchParams();

    useEffect(() => {
        if (hasHandled.current) return;

        const error = params.get("error") as string;

        if (error) {
            hasHandled.current = true;
            const msg = AUTH_ERROR_MAP[error]

            notif.info({
                title: 'Info',
                description: msg
            })

            router.replace("/login");
        }
    }, [params, router]);

    const loginConfig: FieldConfig[][] = [
        [
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
        ],
        [
            {
                col: 24,
                input: {
                    label: "Password",
                    key: "password",
                    suffix: <TbLockPassword />,
                    type: "password_no_rules",
                    placeholder: "Enter your password",
                    rules: [{ required: true, message: "Password is required" }],
                },
            },
        ],
        [
            {
                col: 14,
                text: {
                    key: 'forgot_password',
                    children: (
                        <span className="text-gray-400">Forgot Password ? <Link href="/auth/forgot-password" className="text-(--color-2)! cursor-pointer font-semibold hover:underline!">Here</Link></span>
                    )
                }
            },
            {
                col: 10,
                text: {
                    key: 'register',
                    className: 'text-right!',
                    children: (
                        <span className="text-sm ml-auto! text-gray-400">
                            Don't have an account?{" "}
                            <Link href="/auth/signup" className="text-(--color-2)! cursor-pointer font-semibold hover:underline!">
                                Sign up
                            </Link>
                        </span>
                    )
                }
            },
        ],
        [
            {
                col: 24,
                button: {
                    icon: <LiaSignInAltSolid />,
                    key: "login",
                    label: "Login",
                    htmlType: "submit",
                    size: "large",
                    className: "!bg-gradient-to-r !from-(--color-2) !to-(--color-1) !text-white hover:!bg-gradient-to-r hover:!from-(--color-1) hover:!to-(--color-2) !transition !duration-1000 focus:!border-2 focus:!border-(--color-2)"
                },
            },
        ],
    ];

    const configOtherLogin: FieldConfig[][] = [
        [
            {
                col: 24,
                button: {
                    icon: (
                        <Image
                            src={Google}
                            alt="google"
                            width={18}
                            height={18}
                        />
                    ),
                    label: "Google",
                    key: "google",
                    size: "large",
                    onClick: () => loginProvider()
                }
            }
        ]
    ]

    const handleSubmit = async (values: any) => {
        const success = await useAuthStore.getState().login(values)

        if (success) {
            router.push("/dashboard");
        } else {
            const error = useAuthStore.getState().error
            notif.error({
                title: 'Error',
                description: error || 'Login failed. Please try again.'
            })
        }
    };

    return (
        <>
            <p className="text-xs tracking-widest text-(--color-1) uppercase mb-1">
                Welcome to
            </p>
            <h1 className="text-xl font-bold text-gray-900 mb-5 leading-tight" style={{ fontFamily: "Georgia, serif" }}>
                Sigite Store
            </h1>

            <FormApp
                config={loginConfig}
                form={form}
                onFinish={handleSubmit}
            />
            <div className="relative flex items-center my-3">
                <div className="flex grow border-t border-gray-400"></div>

                <span className="flex shrink mx-4 text-gray-600 text-sm">Or Login With</span>

                <div className="flex grow border-t border-gray-400"></div>
            </div>
            <FormApp
                config={configOtherLogin}
                form={form}
                onFinish={handleSubmit}
            />
        </>
    );
};

export default LoginComp;