"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useInvoiceStore } from "@/store/invoice"
import { Col, Row, Steps, Tag, Button, Divider, Collapse, Skeleton, Alert, QRCode, Typography } from "antd"
import { CheckCircleFilled, ClockCircleFilled, SyncOutlined } from "@ant-design/icons"
import Image from "next/image"
import BoxDefault from "./BoxDefault"
import { Helper } from "@/utils/Helper"
import { InvoiceResult, ProviderStatus, TransactionStatus } from "@/types/payment-gateway.types"
import { BiCopy, BiDownload, BiSupport } from "react-icons/bi"
import { MdEmail, MdPhone } from "react-icons/md"
import { HiOutlineReceiptRefund } from "react-icons/hi"
import { useNotification } from "../provider/NotificationProvider"
import { useWebSocket } from "@/hooks/useWebSocket"

const { Title } = Typography

const formatDate = (iso: string) =>
    new Intl.DateTimeFormat("en-US", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        hour12: false,
    }).format(new Date(iso))

const Countdown = ({ expiredAt }: { expiredAt: string }) => {
    const calc = () => Math.max(0, Math.floor((new Date(expiredAt).getTime() - Date.now()) / 1000))
    const [secs, setSecs] = useState(calc)

    useEffect(() => {
        const id = setInterval(() => setSecs(calc()), 1000)
        return () => clearInterval(id)
    }, [expiredAt])

    if (secs <= 0) return <Tag color="red" className="text-base! font-mono! px-3! py-1!">Expired</Tag>

    const h = Math.floor(secs / 3600).toString().padStart(2, "0")
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, "0")
    const s = (secs % 60).toString().padStart(2, "0")

    return (
        <Tag color="orange" className="text-base! font-mono! px-3! py-1!">
            {h}:{m}:{s}
        </Tag>
    )
}

const STATUS_CONFIG: Record<TransactionStatus, { color: string; label: string }> = {
    PENDING: { color: "orange", label: "Unpaid" },
    PAID: { color: "green", label: "Paid" },
    FAILED: { color: "red", label: "Failed" },
    EXPIRED: { color: "red", label: "Expired" },
}

const PROVIDER_STATUS_CONFIG: Record<string, {
    color: string
    bgClass: string
    borderClass: string
    icon: React.ReactNode
    label: string
    desc: string
    step: number
}> = {
    Pending: {
        color: "#faad14",
        bgClass: "bg-yellow-950/40",
        borderClass: "border-yellow-600/50",
        icon: <ClockCircleFilled className="text-yellow-400 text-2xl" />,
        label: "Payment Received",
        desc: "Your payment has been received. The order is queued for processing.",
        step: 1,
    },
    Process: {
        color: "#5E6AD2",
        bgClass: "bg-blue-950/40",
        borderClass: "border-blue-600/50",
        icon: <SyncOutlined spin className="text-blue-400 text-2xl" />,
        label: "Processing",
        desc: "Your order is being processed by our system. Please wait a moment.",
        step: 1,
    },
    Success: {
        color: "#52c41a",
        bgClass: "bg-green-950/40",
        borderClass: "border-green-600/50",
        icon: <CheckCircleFilled className="text-green-400 text-2xl" />,
        label: "Transaction Successful",
        desc: "Your order has been completed successfully. Thank you!",
        step: 2,
    },
}

const CopyButton = ({ value }: { value: string }) => {
    const notification = useNotification()
    return (
        <BiCopy
            className="inline cursor-pointer text-gray-400 hover:text-white ml-2 transition-colors"
            onClick={() => {
                navigator.clipboard.writeText(value)
                notification.success({
                    title: 'Success',
                    description: "Copied to clipboard"
                })
            }}
        />
    )
}

const OrderSummary = ({ invoice }: { invoice: InvoiceResult }) => {
    const statusCfg = STATUS_CONFIG[invoice.status]
    const providerCfg = invoice.status_provider ? PROVIDER_STATUS_CONFIG[invoice.status_provider] : null

    const summaryRows = [
        {
            label: "Invoice No.",
            value: (
                <span className="font-mono flex items-center gap-1 text-xs">
                    {invoice.ref_id}<CopyButton value={invoice.ref_id} />
                </span>
            ),
        },
        {
            label: "Payment Status",
            value: <Tag color={statusCfg.color}>{statusCfg.label}</Tag>,
        },
        ...(providerCfg ? [{
            label: "Order Status",
            value: (
                <Tag
                    style={{ color: providerCfg.color, borderColor: providerCfg.color, background: "transparent" }}
                    className="flex items-center gap-1"
                >
                    {providerCfg.label}
                </Tag>
            ),
        }] : []),
        { label: "Date", value: formatDate(invoice.created_at) },
        { label: "Payment Method", value: invoice.channel.name },
        {
            label: "Kategori",
            value: (
                <span className="flex items-center gap-2">
                    <Image src={invoice.product.category_image} alt={invoice.product.category_name} width={20} height={20} className="rounded" />
                    {invoice.product.category_name}
                </span>
            ),
        },
        {
            label: "Produk",
            value: (
                <span className="flex items-center gap-2">
                    <Image src={invoice.product.icon} alt={invoice.product.product_name} width={20} height={20} className="rounded" />
                    {invoice.product.product_name}
                </span>
            ),
        },
    ]

    const accountRows = Object.entries(invoice.account_data).map(([key, val]) => ({
        label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        value: String(val ?? ""),
    }))

    return (
        <BoxDefault>
            <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                <HiOutlineReceiptRefund className="text-blue-400" />
                Order Summary
            </h3>
            <div className="space-y-2 text-sm">
                {[...summaryRows, ...accountRows].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center gap-x-4">
                        <span className="text-gray-400 shrink-0">{label}</span>
                        <span className="text-right font-medium">{value}</span>
                    </div>
                ))}
            </div>
            <Divider className="my-3 border-gray-600!" />
            <div className="text-xs text-gray-500 flex gap-3 flex-wrap">
                <span><MdPhone className="inline mr-1" />{invoice.phone}</span>
                <span><MdEmail className="inline mr-1" />{invoice.email}</span>
            </div>
        </BoxDefault>
    )
}

const QrPayment = ({ invoice }: { invoice: InvoiceResult }) => {
    const handleDownload = () => {
        const canvas = document.getElementById("invoice-qr")?.querySelector("canvas")
        if (!canvas) return
        const a = document.createElement("a")
        a.href = canvas.toDataURL("image/png")
        a.download = `${invoice.ref_id}-qr.png`
        a.click()
    }

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-lg shadow-blue-900/20">
                <QRCode
                    id="invoice-qr"
                    value={invoice.qr_string!}
                    size={220}
                    bordered={false}
                    color="black"
                />
            </div>
            <Button
                icon={<BiDownload />}
                onClick={handleDownload}
                className="w-full! bg-[#5E6AD2]! border-0! text-white! rounded-full! font-semibold! hover:bg-[#4B59C4]!"
            >
                Download QR Code
            </Button>
        </div>
    )
}

const VaPayment = ({ invoice }: { invoice: InvoiceResult }) => (
    <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between bg-gray-800 rounded-xl px-5 py-4 border border-gray-700">
            <div>
                <p className="text-xs text-gray-400 mb-1">Virtual Account Number</p>
                <span className="text-xl font-mono font-bold tracking-widest text-white">
                    {invoice.va_number}
                </span>
            </div>
            <CopyButton value={invoice.va_number!} />
        </div>
        <div className="flex items-center justify-between">
            {invoice.channel.image ? (
                <Image src={invoice.channel.image} alt={invoice.channel.name} width={80} height={32} className="object-contain rounded" />
            ) : (
                <span className="text-sm text-gray-400">{invoice.channel.name}</span>
            )}
            <span className="text-sm text-gray-400">{invoice.channel.name}</span>
        </div>
    </div>
)

const PaidStatusPanel = ({ providerStatus }: { providerStatus: ProviderStatus }) => {
    const cfg = providerStatus ? PROVIDER_STATUS_CONFIG[providerStatus] : null
    if (!cfg) return null
    return (
        <div className={`flex items-start gap-4 rounded-2xl border p-5 ${cfg.bgClass} ${cfg.borderClass}`}>
            <div className="shrink-0 mt-0.5">{cfg.icon}</div>
            <div>
                <p className="font-semibold text-base text-white mb-0.5">{cfg.label}</p>
                <p className="text-sm text-gray-400">{cfg.desc}</p>
            </div>
        </div>
    )
}

const AmountDisplay = ({ invoice }: { invoice: InvoiceResult }) => (
    <div className="flex items-center justify-between bg-gray-800/60 rounded-xl px-5 py-4 border border-gray-700">
        <div>
            <p className="text-xs text-gray-400 mb-1">Total Payment</p>
            <div className="flex items-center gap-2">
                <Title level={4} className="text-blue-400! mb-0!">
                    {Helper.formatRupiah(invoice.amount)}
                </Title>
                <CopyButton value={String(invoice.amount)} />
            </div>
        </div>
        {invoice.channel.image ? (
            <Image src={invoice.channel.image} alt={invoice.channel.name} width={60} height={24} className="object-contain opacity-70 rounded" />
        ) : (
            <span className="text-sm text-gray-400 truncate max-w-[120px]">{invoice.channel.name}</span>
        )}
    </div>
)

const STEP_TITLES = ["Make Payment", "Transaction Processing", "Transaction Successful"]

const currentStepFor = (status: TransactionStatus, providerStatus: ProviderStatus | null): number => {
    if (status !== "PAID") return 0
    if (!providerStatus) return 1
    const cfg = PROVIDER_STATUS_CONFIG[providerStatus]
    return cfg ? cfg.step : 1
}

const isPaidDone = (status: TransactionStatus) => status === "PAID"

const PaymentPanel = ({ invoice }: { invoice: InvoiceResult }) => {
    const isPaid = isPaidDone(invoice.status)
    const step = currentStepFor(invoice.status, invoice.status_provider)

    return (
        <BoxDefault>
            <Steps
                current={step}
                status={invoice.status_provider === "Success" ? "finish" : "process"}
                orientation="vertical"
                items={STEP_TITLES.map((title, i) => ({
                    title: (
                        <span className={`font-semibold text-base ${i === step ? "text-white" : i < step ? "text-gray-400" : "text-gray-600"}`}>
                            {title}
                        </span>
                    ),
                    content: (() => {
                        if (i === 0 && !isPaid) {
                            return (
                                <div className="mt-3 space-y-4 pb-4">
                                    {invoice.expired_at && (
                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                            <span className="text-sm text-gray-400">
                                                Complete before {formatDate(invoice.expired_at)}
                                            </span>
                                            <Countdown expiredAt={invoice.expired_at} />
                                        </div>
                                    )}
                                    <AmountDisplay invoice={invoice} />
                                    {invoice.payment_type === "QR_CODE" && invoice.qr_string && (
                                        <QrPayment invoice={invoice} />
                                    )}
                                    {invoice.payment_type === "BANK_TRANSFER" && invoice.va_number && (
                                        <VaPayment invoice={invoice} />
                                    )}
                                </div>
                            )
                        }
                        if (i === 0 && isPaid) {
                            return (
                                <div className="pb-2">
                                    <p className="text-xs text-gray-500 mt-1">
                                        Paid on {formatDate(invoice.created_at)}
                                        &nbsp;·&nbsp;
                                        <span className="text-blue-400 font-medium">{Helper.formatRupiah(invoice.amount)}</span>
                                    </p>
                                </div>
                            )
                        }
                        if (i === 1 && isPaid && invoice.status_provider) {
                            return (
                                <div className="mt-2 pb-3">
                                    <PaidStatusPanel providerStatus={invoice.status_provider} />
                                </div>
                            )
                        }
                        return null
                    })(),
                }))}
            />
        </BoxDefault>
    )
}

const buildHelpItems = (paymentType: string) => [
    {
        key: "how",
        label: <span className="font-semibold text-white">How to make a payment?</span>,
        children: (
            <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
                {paymentType === "QR_CODE" ? (
                    <>
                        <li>Open your digital wallet or mobile banking app</li>
                        <li>Select the Scan QR feature</li>
                        <li>Scan the QR code above</li>
                        <li>Confirm the payment amount</li>
                    </>
                ) : (
                    <>
                        <li>Open your mobile banking or internet banking app</li>
                        <li>Select Transfer to Virtual Account</li>
                        <li>Enter the VA number above</li>
                        <li>Confirm the amount and complete the payment</li>
                    </>
                )}
            </ol>
        ),
    },
]

const InvoicePage = ({ ref_id }: { ref_id: string }) => {
    const hasFetched = useRef(false)
    const { getInvoice, invoice, loading, error } = useInvoiceStore()
    const [realtimeConnected, setRealtimeConnected] = useState(false)

    
    const handleWSUpdate = useCallback(() => {
        console.log("[InvoicePage] WS update received, re-fetching invoice...")
        getInvoice(ref_id)
    }, [ref_id, getInvoice])

    const ws = useWebSocket(ref_id, handleWSUpdate)

    useEffect(() => {
        if (!hasFetched.current) {
            hasFetched.current = true
            getInvoice(ref_id)
        }
    }, [ref_id])

    if (loading) {
        return (
            <Row gutter={[24, 0]} className="w-full!">
                <Col span={8}><Skeleton active /></Col>
                <Col span={16}><Skeleton active /></Col>
            </Row>
        )
    }

    if (error || !invoice) {
        return (
            <Alert
                type="error"
                showIcon
                title="Invoice not found"
                description={error ?? "Please make sure the ref_id you entered is correct."}
            />
        )
    }

    const isPaid = isPaidDone(invoice.status)

    return (
        <Row gutter={[24, 16]} className="w-full!">
            <Col xs={24} md={8}>
                <div className="sticky top-44">
                    <OrderSummary invoice={invoice} />
                </div>
            </Col>
            <Col xs={24} md={16}>
                <PaymentPanel invoice={invoice} />
                {!isPaid && (
                    <Collapse
                        ghost
                        className="bg-(--color-4)! rounded-2xl! border border-gray-600! mb-4!"
                        items={buildHelpItems(invoice.payment_type)}
                    />
                )}
                <BoxDefault>
                    <div className="flex items-start gap-3">
                        <BiSupport className="text-2xl text-blue-400 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold mb-1">Need help?</h4>
                            <p className="text-sm text-gray-400">
                                If your top-up hasn't arrived, please contact us via{" "}
                                <a href="mailto:support@sigite.id" className="text-blue-400 hover:underline">
                                    Contact Us
                                </a>
                            </p>
                        </div>
                    </div>
                </BoxDefault>
            </Col>
        </Row>
    )
}

export default InvoicePage


