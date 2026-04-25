"use client"

import { useProductStore } from "@/store/product"
import HeaderComp from "../layouts/Header"
import { useEffect, useRef, useState } from "react"
import { FieldConfig, FormApp } from "../atom/Form"
import Link from "next/link"
import Image from "next/image"
import { Form } from "antd"
import BaseLayout from "../layouts"
import BannerCarousel from "./BannerCarousel"

const HomeComp = () => {
    const hasFetched = useRef(false)
    const [form] = Form.useForm()
    const { getProducts, meta_products, products } = useProductStore()
    const [config_products, set_config_products] = useState<FieldConfig[][]>([])

    useEffect(() => {
        if (!hasFetched.current) {
            getProducts(1)
            hasFetched.current = true
        }
    }, [])

    useEffect(() => {
        if (!products.length) return

        set_config_products([
            products.map((item) => ({
                col: 4,
                other: (
                    <Link href={`/category/${item.slug}`} key={item.slug}>
                        <div className="group relative w-full h-64 rounded-xl overflow-hidden transition-transform duration-300 hover:-translate-y-2">
                            <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-contain transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition duration-300" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                                <span className="text-white text-sm font-semibold text-center px-2">
                                    {item.display_name}
                                </span>
                            </div>

                        </div>
                    </Link>
                )
            }))
        ])
    }, [products])


    return (
        <BaseLayout>
            <BannerCarousel />
            <div className="my-3">
                <h3 className="font-semibold">BOOST YOUR GAME NOW</h3>
                <p className="text-gray-400">Top up instantly without login</p>
            </div>
            <FormApp
                config={config_products}
                form={form}
            />
        </BaseLayout>
    )
}

export default HomeComp