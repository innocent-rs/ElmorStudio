import {Device, Group, ItemTypes} from "./model.ts";
import {useDrag} from "react-dnd";

function DeviceCard({device, group}: {
    device: Device;
    //onDrop: (dragged: Device, target: Device) => void;
    group: Group;
    //onRemoveFromGroup: (deviceId: number) => void
}) {
    // Drag functionality
    const [{isDragging}, drag] = useDrag(() => ({
        type: ItemTypes.DEVICE,
        canDrag: () => !group.is_locked,
        item: {deviceId: device.id, sourceGroupId: group.id},
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }), [group]);

    // Drop functionality
    /*    const [{isOver, canDrop}, drop] = useDrop(() => ({
            accept: ItemTypes.DEVICE,
            /!*        canDrop: (d) => {
                        return d.folder === 'Ungrouped' || d.folder !== device.folder;
                    },*!/
            drop: (draggedDevice: Device) => {
                //onDrop(draggedDevice, device); // Call drop handler
            },
            collect: (monitor) => ({
                isOver: monitor.isOver(), // Tracks if an item is currently being hovered over
                canDrop: monitor.canDrop(), // Tracks if the drop can happen
            }),
        }));*/

    // Visual feedback for drop target
    /*    const isActive = canDrop && isOver;
        let borderColor = 'border-gray-700';
        if (isActive) {
            borderColor = 'border-green-500'; // When a valid device is dragged over
        } else if (canDrop) {
            borderColor = 'border-blue-500'; // When a device can be dropped, but not hovering yet
        }*/

    return (
        <div
            ref={(node) => drag(/*drop*/(node))} // Combine drag and drop refs
            className={`bg-gray-800 rounded-xl shadow-lg p-6 border hover:border-blue-500 transition duration-300 transform hover:scale-105 ${
                isDragging ? 'opacity-50' : ''
            }`} // Change border based on state
        >
            <h2 className="text-2xl font-semibold mb-2 text-white">{device.kind}</h2>
            <p className="text-gray-400 mb-4">
                Port: {device.port} <br/>
                Firmware version: 0x{device.firmware}
            </p>
            {/*            {device.folder && (
                <button
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500"
                    onClick={() => onRemoveFromGroup(device.id)}
                >
                    Remove from Group
                </button>
            )}*/}
        </div>
    );
}

export default DeviceCard;