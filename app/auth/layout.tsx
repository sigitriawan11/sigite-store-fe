import { BGLogin, Logo } from "@/assets";
import { ConfigProvider } from "antd";
import Image from "next/image";

export default function LayoutAuth({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: "#3852B4",
                    colorSuccess: "#2F6B3F",
                    colorWarning: "#F7C85C",
                    colorTextBase: 'black'
                },
            }}>
            <div className="relative min-h-screen w-full overflow-x-hidden">

                <Image
                    src={BGLogin.src}
                    alt="Background"
                    fill
                    className="object-cover"
                    priority
                />

                <svg
                    className="absolute inset-0 w-full h-full hidden lg:block"
                    viewBox="0 0 1300 900"
                    preserveAspectRatio="xMidYMid slice"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="
                            M 0 0
                            L 680 0
                            C 710 0, 740 40, 732 160
                            C 722 320, 640 400, 650 560
                            C 660 700, 740 760, 730 900
                            L 0 900
                            Z
                        "
                        fill="white"
                    />
                    <path
                        d="
                            M 680 0
                            C 710 0, 740 40, 732 160
                            C 722 320, 640 400, 650 560
                            C 660 700, 740 760, 730 900
                        "
                        fill="none"
                        stroke="#a78bfa"
                        strokeWidth="2"
                        opacity="0.4"
                    />
                </svg>

                <div className="absolute inset-0 flex items-start justify-center lg:justify-start overflow-auto py-6 sm:py-10 px-4">
                    <div className="w-full max-w-md lg:max-w-none lg:w-[50%] lg:px-10">
                        <div className="bg-white/95 lg:bg-transparent rounded-2xl shadow-xl lg:shadow-none p-5 sm:p-6 lg:p-0">
                            <Image src={Logo.src} alt="logo" width={100} height={50} className="mb-5" />

                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </ConfigProvider>
    )
}