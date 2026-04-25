import { ChannelItem, useChannelStore } from "@/store/channel";
import { useProductStore } from "@/store/product";
import { Helper } from "@/utils/Helper";
import Image from "next/image";
import { useEffect, useState } from "react";

type PaymentChannelItem = ChannelItem

type Props = {
    item: PaymentChannelItem
    onClick?: (item: PaymentChannelItem) => void
}

const CardPaymentMethod = ({ item, onClick }: Props) => {
    const { select_product } = useProductStore()
    const { setSelectedChannel, select_channel } = useChannelStore()
    const isActive = item.is_active
    const [price, setPrice] = useState(0)

    useEffect(() => { 
        if (select_product) {
            const calculatedPrice = item.type_fee === '%'
                ? select_product.price + (item.fee * select_product.price)
                : select_product.price + item.fee
            setPrice(calculatedPrice)
        }
    }, [select_product])

    return (
        <div
            onClick={() => {
                if (isActive && price >= item.min && onClick) {
                    setSelectedChannel(item)
                    return onClick(item)
                }
            }}
            className={`
                min-h-20
                relative flex items-center justify-between
                rounded-xl border px-4 py-3 mb-3
                transition-all duration-300
                ${isActive
                    ? "cursor-pointer bg-(--color-4) hover:scale-[1.01] hover:border-gray-200"
                    : "cursor-not-allowed bg-(--color-4) opacity-70 grayscale"}
                ${select_channel?.code === item.code ? "border-blue-500 border-2 hover:border-blue-700!" : ""}
            `}
        >
            {!isActive && (
                <div className="absolute top-2 right-2 z-20 bg-red-500 text-white text-[10px] px-2 py-1 rounded-full font-semibold">
                    Not Active
                </div>
            )}

            {!isActive && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-black/40">
                    <span className="text-white text-xs font-semibold">
                        Unavailable
                    </span>
                </div>
            )}
            
            {price < item.min && (
                <div className="absolute top-2 right-2 z-20 bg-red-500 text-white text-[10px] px-2 py-1 rounded-full font-semibold">
                    Min price {Helper.formatRupiah(item.min)}
                </div>
            )}

            {price < item.min && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-black/40">
                    <span className="text-white text-xs font-semibold">
                        Unavailable
                    </span>
                </div>
            )}

            <div className="flex flex-col z-0">
                <span className="font-semibold text-sm">
                    {item.name}
                </span>

                <span className="text-xs text-gray-500">
                    {select_product ? Helper.formatRupiah(price) : 'Rp 0'}
                </span>
            </div>

            <div className="z-0">
                <Image
                    src={item.image}
                    alt={item.name}
                    width={50}
                    height={30}
                    className="object-contain"
                />
            </div>
        </div>
    )
}

export default CardPaymentMethod