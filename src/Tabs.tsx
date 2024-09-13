import {useState} from "react";
import DeviceList from "./DeviceList.tsx";

function Tabs() {
    const [activeTab, setActiveTab] = useState(0);

    const tabs = ['Devices'];
    const content = [
        <DeviceList />,
    ];

    return (
        <div className="w-full mx-auto mt-8">
            <div className="flex space-x-2">
                {tabs.map((tab, index) => (
                    <button
                        key={index}
                        className={`px-4 py-2 font-semibold rounded-t-lg ${
                            activeTab === index
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                        onClick={() => setActiveTab(index)}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            <div className="p-4 bg-gray-800 rounded-b-lg">
                {content[activeTab]}
            </div>
        </div>
    );
}

export default Tabs;