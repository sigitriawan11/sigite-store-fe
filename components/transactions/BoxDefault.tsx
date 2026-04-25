const BoxDefault = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <div className="rounded-2xl shadow mb-4 bg-(--color-4) px-5 py-3 border border-gray-400">
            {children}
        </div>
    )
}

export default BoxDefault