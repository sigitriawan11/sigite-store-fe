type DataItem = {
    title: string,
    title_account: string,
    account: Array<{
        label: string;
        value: string;
    }>,
    title_order_detail: string,
    order_detail: Array<{
        label: string;
        value: string;
    }>,
    total: string;

}

const ConfirmOrder: React.FC<DataItem> = (data) => {
    return (
        <div className="text-black text-base md:text-lg">
            <h2 className="md:text-lg text-gray-700 font-semibold">{data.title}</h2>
            <h2 className="font-semibold flex items-center justify-between space-x-5">
                <span className="block">{data.title_order_detail}</span>
                <span className="block h-0.5 w-64 rounded-full bg-gray-400"></span>
            </h2>
            {data.account.map((item, index) => (
                <div className="flex justify-between items-center" key={index}>
                    <span className="capitalize">{item.label.split('_').join(' ')}</span>
                    <span>{item.value}</span>
                </div>
            ))}
            <h2 className="font-semibold flex items-center justify-between space-x-5">
                <span className="block">{data.title_order_detail}</span>
                <span className="block h-0.5 w-64 rounded-full bg-gray-400"></span>
            </h2>
            {data.order_detail.map((item, index) => (
                <div className="flex justify-between items-center" key={index}>
                    <span>{item.label.split('_').join(' ')}</span>
                    <span>{item.value}</span>
                </div>
            ))}
            <h2 className="font-semibold flex items-center justify-between space-x-5">
                <span className="block">Total Transaction</span>
                <span className="block h-0.5 w-64 rounded-full bg-gray-400"></span>
            </h2>
            <h2>Total: {data.total}</h2>
        </div>
    )
}

export default ConfirmOrder;