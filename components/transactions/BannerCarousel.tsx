"use client"
import { Carousel } from "antd"
import { useEffect, useRef } from "react"
import type { CarouselRef } from "antd/es/carousel"
import { useLayoutStore } from "@/store/layout"
import Image from "next/image"

const BannerCarousel = () => {
    const ref = useRef<CarouselRef>(null)
    const { banners, getBanners } = useLayoutStore()
    const hasFetched = useRef(false)

    useEffect(() => {
        if (!hasFetched.current) {
            getBanners()
            hasFetched.current = true
        }
    }, [])

    return (
        <div className="relative w-full rounded-xl overflow-hidden">
            <Carousel
                ref={ref}
                autoplay
                autoplaySpeed={3000}
                speed={500}
                dots={{ className: "custom-dots" }}
            >
                {banners?.map((item: any) => (
                    <div key={item.id}>
                        <div className="relative w-full aspect-16/5">
                            <Image
                                src={item.image}
                                alt="banner"
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    </div>
                ))}
            </Carousel>

            {/* Nav arrows */}
            <button
                onClick={() => ref.current?.prev()}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center text-white"
                style={{ background: "rgba(0,0,0,0.4)" }}
            >
                ←
            </button>

            <button
                onClick={() => ref.current?.next()}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center text-white"
                style={{ background: "rgba(0,0,0,0.4)" }}
            >
                →
            </button>
        </div>
    )
}

export default BannerCarousel