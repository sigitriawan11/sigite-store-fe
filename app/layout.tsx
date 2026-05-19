import type { Metadata } from "next";
import "./globals.css";
import { ConfigProvider, theme } from "antd";
import { NotificationProvider } from "@/components/provider/NotificationProvider";
import ClientOnly from "@/components/layouts/ClientOnly";
import { Orbitron, Poppins } from 'next/font/google'
import Script from "next/script";

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '600', '700'] })

const { defaultAlgorithm } = theme;

export const metadata: Metadata = {
  title: {
    default: "Sigite Store",
    template: "Sigite Store - %s",
  },
  description: "Dynamic Workflow System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.className} antialiased bg-(--color-3)!`}
      >
        <ConfigProvider
          theme={{
            algorithm: defaultAlgorithm,
            token: {
              colorTextBase: 'white',
            },
            components: {
              Input: {
                activeBorderColor: '#BFC6C4',
                activeShadow: '0 0 0 2px #BFC6C4',
                hoverBorderColor: '#BFC6C4'
              },
              Select: {
                activeBorderColor: '#BFC6C4',
                activeOutlineColor: '#BFC6C4',
                hoverBorderColor: '#BFC6C4',
              },
              Notification: {
                colorText: 'black',
                colorInfoText: 'black',
                colorErrorText: 'black',
                colorSuccessText: 'black',
                colorWarningText: 'black',
                colorTextHeading: 'black',
              },
              Modal: {
                titleColor: 'black',
              }
            }
          }}>
          <NotificationProvider>
            <ClientOnly>
              {children}
            </ClientOnly>
          </NotificationProvider>
        </ConfigProvider>
        <Script src="https://cdn.lordicon.com/lordicon.js" strategy="beforeInteractive"></Script>
      </body>
    </html>
  );
}
