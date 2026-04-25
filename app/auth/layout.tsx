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
                    className="absolute inset-0 w-full h-full"
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

                <div className="absolute inset-0 flex items-start overflow-auto py-10">
                    <div className="w-[50%] px-5 xl:px-10">
                        <Image src={Logo.src} alt="logo" width={100} height={50} className="mb-5" />

                        {children}
                    </div>
                </div>
            </div>
        </ConfigProvider>
    )
}