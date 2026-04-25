import { ProductItem, useProductStore } from "@/store/product";
import { Helper } from "@/utils/Helper";
import Image from "next/image";

const CardProduct = ({ item }: { item: ProductItem }) => {
    const { setCurrentStep, setSelectedProduct } = useProductStore()
    return (
        <div
            key={item.code}
            onClick={() => {
                if (item.status) {
                    setSelectedProduct(item)
                    setCurrentStep(1)
                }
            }}
            className={`
            relative rounded-t-2xl shadow w-full mb-3 border transition-all duration-300
            ${item.status
                    ? 'cursor-pointer bg-(--color-4) hover:border-gray-100 hover:scale-[1.02]'
                    : 'cursor-not-allowed bg-(--color-4) opacity-70 grayscale'}
          `}
        >
            {!item.status && (
                <div className="absolute top-2 right-2 z-20 bg-red-500 text-white text-[10px] px-2 py-2 rounded-full font-semibold">
                    Not Active
                </div>
            )}

            {!item.status && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-t-2xl bg-black/40">
                    <span className="text-white text-xs font-semibold">
                        Unavailable
                    </span>
                </div>
            )}

            <div className="px-5 py-3 text-center">
                <Image
                    src={item.icon}
                    alt={item.code}
                    width={30}
                    height={30}
                    className="mx-auto!"
                />

                <div className="line-clamp-2 mt-2 min-h-10">
                    {item.product_name}
                </div>
            </div>

            <div className="w-full bg-linear-to-r from-(--color-2) to-(--color-3) rounded-t-2xl py-1 px-2">
                <h3 className="text-center font-semibold">
                    {Helper.formatRupiah(item.price)}
                </h3>
            </div>
        </div>
    )
}

export default CardProduct