"use client"

import { FieldConfig, FormApp } from "@/components/atom/Form"
import { useProductStore } from "@/store/product"
import { Col, Form, Row, Steps, Button } from "antd"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import SkeletonLoad from "../layouts/Skeleton"
import CardProduct from "./CardProduct"
import BoxDefault from "./BoxDefault"
import { BiLeftArrowCircle, BiPhoneCall, BiRightArrowCircle, BiShoppingBag } from "react-icons/bi"
import { MdEmail, MdPayments } from "react-icons/md"
import { useChannelStore } from "@/store/channel"
import CardPaymentMethod from "./CardPaymentMethod"
import { Helper } from "@/utils/Helper"

const CategoryProduct = ({ slug }: { slug: string }) => {
    const hasFetched = useRef(false)
    const [form] = Form.useForm()
    const [form_2] = Form.useForm()
    const [config_products, set_config_products] = useState<FieldConfig[][]>([])
    const [config_payment_method, set_payment_method] = useState<FieldConfig[][]>([])
    const [config_user_data, set_config_user_data] = useState<any>([])
    const { getProductCategoryBySlug, product_detail, current_step, select_product, setSelectedProduct, setCurrentStep } = useProductStore()
    const { getChannels, channels, select_channel, setSelectedChannel } = useChannelStore()
    const router = useRouter()

    const init = async () => {
        const data = await getProductCategoryBySlug(slug)
        await getChannels()
        if (!data) {
            router.push('/')
        }
    }

    useEffect(() => {
        setCurrentStep(0)

        if (!hasFetched.current) {
            init()
            hasFetched.current = true

        }
    }, [])

    const config_confirm: FieldConfig[][] = [
        [
            {
                col: 12,
                input: {
                    key: 'phone',
                    type: 'phone',
                    label: 'Your phone number',
                    name: 'phone',
                    suffix: <BiPhoneCall />,
                    rules: [
                        {
                            required: true,
                            message: 'Phone number is required'
                        }
                    ],
                    className: 'bg-transparent! rounded-lg!',
                    placeholder: '08xxxxxxxxxx'
                }
            },
            {
                col: 12,
                input: {
                    key: 'email_recipient',
                    type: 'email',
                    label: 'Recipient of the invoice email',
                    name: 'email_recipient',
                    suffix: <MdEmail />,
                    rules: [
                        {
                            required: true,
                            message: 'Email is required'
                        },
                    ],
                    className: 'bg-transparent! rounded-lg!',
                    placeholder: 'email@example.com'
                }
            },
            {
                col: 3,
                button: {
                    label: 'Back',
                    key: 'back',
                    onClick: () => {
                        setSelectedProduct(null)
                        setCurrentStep(0)
                    },
                    icon: <BiLeftArrowCircle />,
                    className: "!bg-gradient-to-r !from-(--color-2) !to-(--color-1) !text-white hover:!bg-gradient-to-r hover:!from-(--color-1) hover:!to-(--color-2) !transition !duration-1000 focus:!border-2 focus:!border-(--color-2)"
                }
            },
            {
                col: 17,
            },
            {
                col: 4,
                button: {
                    label: 'Continue',
                    key: 'continue',
                    onClick: async () => {
                        if (current_step === 1) {
                            await form.validateFields(['phone', 'email_recipient'])
                        }

                        setCurrentStep(current_step + 1)

                    },
                    icon: <BiRightArrowCircle />,
                    className: "!bg-gradient-to-r !from-(--color-2) !to-(--color-1) !text-white hover:!bg-gradient-to-r hover:!from-(--color-1) hover:!to-(--color-2) !transition !duration-1000 focus:!border-2 focus:!border-(--color-2)"
                }
            },
        ]
    ]

    useEffect(() => {
        if (!product_detail) return

        set_config_products([
            product_detail.product_items.map((item) => ({
                col: 6,
                other: <CardProduct item={item} />
            }))
        ])

        set_config_user_data(product_detail.product.account_config)
    }, [product_detail])

    useEffect(() => {
        if (!channels) return

        set_payment_method([
            channels.map((item) => ({
                col: 24,
                other: (
                    <div key={item.type}>
                        <h3 className="bg-gray-300/40 w-fit text-black rounded-md px-4 py-2 mb-3 font-semibold">
                            <MdPayments className="inline" /> {item.name}
                        </h3>
                        <div className="space-y-2">
                            <div className="grid grid-cols-4 gap-3">
                                {item.channels.map((channel) => (
                                    <CardPaymentMethod
                                        key={channel.code}
                                        item={channel}
                                        onClick={(val) => {
                                            setSelectedChannel(val)
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )
            }))
        ])

    }, [channels])

    const selectedChannelPrice = select_channel && select_product
        ? select_channel.type_fee === '%'
            ? select_product.price + (select_channel.fee * select_product.price)
            : select_product.price + select_channel.fee
        : 0

    return (
        <>
            <Row gutter={[24, 0]} className={`w-full! ${current_step === 2 && select_channel ? 'pb-36' : ''}`}>
                <Col span={5}>
                    <div className="sticky top-44">
                        {product_detail ? (
                            <div className="rounded-2xl shadow bg-(--color-4)">
                                <Image
                                    src={product_detail!.product.image}
                                    alt={product_detail!.product.display_name}
                                    width={250}
                                    height={200}
                                />
                            </div>
                        ) : (
                            <SkeletonLoad />
                        )}
                    </div>
                </Col>
                <Col span={19}>
                    <div>
                        <BoxDefault>
                            <h3 className="font-semibold text-2xl">{product_detail?.product.display_name}</h3>
                            <div className="flex items-center gap-x-3 text-base mt-2">
                                <h3 className="text-gray-300">Fast</h3>
                                <lord-icon
                                    trigger="loop"
                                    src="https://cdn.lordicon.com/warimioc.json"
                                    colors="primary:#b82e2e,secondary:#b82e2e"
                                    style={{ width: 20, height: 20 }}>
                                </lord-icon>
                                <h3 className="text-gray-300">Secure</h3>
                                <lord-icon
                                    trigger="loop"
                                    src="https://cdn.lordicon.com/apbwvyeg.json"
                                    colors="primary:#5E7AC4,secondary:#5E7AC4"
                                    style={{ width: 20, height: 20 }}>
                                </lord-icon>
                                <h3 className="text-gray-300">Best Price</h3>
                                <lord-icon
                                    trigger="loop"
                                    src="https://cdn.lordicon.com/dkobpcrm.json"
                                    colors="primary:#a8a82d,secondary:#a8a82d"
                                    style={{ width: 20, height: 20 }}>
                                </lord-icon>
                            </div>
                        </BoxDefault>
                        <BoxDefault>
                            <h3 className="font-semibold text-xl">Enter account details</h3>
                            <FormApp form={form} config={config_user_data} />
                        </BoxDefault>
                        <BoxDefault>
                            <Steps
                                current={current_step}
                                items={[
                                    { title: 'Select Item' },
                                    { title: 'Order Details' },
                                    { title: 'Payment Method' },
                                ]}
                            />
                        </BoxDefault>
                        {current_step === 0 && (
                            <div>
                                <FormApp
                                    config={config_products}
                                    form={form_2}
                                />
                            </div>
                        )}
                        {current_step === 1 && (
                            <BoxDefault>
                                <div className="flex items-center gap-x-5">
                                    <Image src={select_product?.icon!} alt={select_product?.code!} width={50} height={50} />
                                    <div className="flex flex-col">
                                        <h3 className="text-lg">{select_product?.product_name}</h3>
                                        <h3 className="text-sm text-gray-400">Quantity : 1x</h3>
                                    </div>
                                </div>
                                <FormApp
                                    config={config_confirm}
                                    form={form_2}
                                />
                            </BoxDefault>
                        )}
                        {current_step === 2 && (
                            <FormApp
                                config={config_payment_method}
                                form={form_2}
                            />
                        )}
                    </div>
                </Col>
            </Row>

            {current_step === 2 && (
                <div className="fixed bottom-0 left-0 max-w-7xl mx-auto right-0 z-50 bg-(--color-3) border-[1.5px] border-dotted border-gray-700 px-10 py-4 shadow-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-y-1">
                            <div className="flex items-center gap-x-2">
                                <BiShoppingBag className="text-blue-400 text-xl" />
                                <span className="text-blue-400 font-bold text-xl">
                                    {Helper.formatRupiah(selectedChannelPrice)}
                                </span>
                            </div>
                            <div className="text-sm font-semibold text-white">
                                {select_product?.product_name}
                                {form_2.getFieldValue('phone') && (
                                    <span className="text-gray-300"> • {form_2.getFieldValue('phone')}</span>
                                )}
                            </div>
                        </div>

                        <div className="space-x-3">
                            <Button
                                size="large"
                                className="bg-white! hover:bg-gray-300! text-black! rounded-full! w-44! font-semibold! shadow-xl! border-2! border-[#4B59C4]! transition! duration-300!"
                                onClick={() => {
                                    setCurrentStep(1)
                                }}
                            >
                                Kembali
                            </Button>
                            <Button
                                disabled={!select_channel}
                                size="large"
                                className="bg-[#5E6AD2]! disabled:bg-gray-400! text-white! rounded-full! w-44! font-semibold! shadow-xl! border-0! hover:bg-[#4B59C4]! transition! duration-300!"
                                onClick={async () => {
                                    if (current_step == 2) {
                                        await form.validateFields(['phone', 'email_recipient'])
                                    }
                                }}
                            >
                                Bayar Sekarang
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default CategoryProduct