"use client"

import HeaderComp from "../layouts/Header"

const BaseLayout = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <div className="flex flex-col min-h-screen text-white!">

            <HeaderComp />

            <div className="flex-1 bg-(--color-3)">
                <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:p-7">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default BaseLayout