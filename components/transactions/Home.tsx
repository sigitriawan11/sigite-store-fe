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
            [
                {
                    col: 24,
                    other: (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {products.map((item) => (
                                <Link href={`/category/${item.slug}`} key={item.slug}>
                                    <div className="group relative w-full aspect-[3/4] lg:aspect-auto lg:h-64 rounded-xl overflow-hidden transition-transform duration-300 hover:-translate-y-2">
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            unoptimized
                                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                                            className="object-cover lg:object-contain transition-transform duration-300 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition duration-300" />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                                            <span className="text-white text-sm font-semibold text-center px-2">
                                                {item.display_name}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )
                }
            ]
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