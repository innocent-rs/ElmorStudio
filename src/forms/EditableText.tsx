import {useRef, useState} from "react";
import {PencilIcon} from "@heroicons/react/24/solid";
import Input from "./Input.tsx";

const EditableText = ({initialValue, onSave, canEdit}: {
    initialValue: string;
    onSave(newText: string): Promise<void>;
    canEdit: boolean;
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(initialValue);
    const inputRef = useRef<HTMLInputElement>(null);

    // Save handler
    const handleSave = async () => {
        if (!text.trim() || !canEdit) return; // Prevent saving empty text
        await onSave(text);
        setIsEditing(false);
    };

    // Cancel editing
    const handleCancel = () => {
        setText(initialValue); // Revert to the initial value
        setIsEditing(false);
    };

    // Switch to editing mode
    const handleEdit = () => {
        if(!canEdit) return;
        setIsEditing(true);
        setTimeout(() => {
            inputRef.current?.focus(); // Focus the input after render
        }, 0);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    return (
        <div className="w-full">
            {isEditing ? (
                <div className="flex items-center space-x-2 w-full">
                    <Input ref={inputRef} value={text} handleChange={setText} disabled={canEdit} onKeyDown={handleKeyDown} />
{/*                    <input
                        ref={inputRef}
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full p-2 bg-gray-800 text-white rounded outline-none focus:ring-2 focus:ring-blue-500"
                    />*/}
                    <button
                        onClick={handleSave}
                        disabled={initialValue === text}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all disabled:bg-gray-600"
                    >
                        Save
                    </button>
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-all"
                    >
                        Cancel
                    </button>
                </div>
            ) : (
                /*                <div
                                    className="w-full p-2 bg-gray-800 text-white rounded cursor-pointer"
                                    onClick={handleEdit} // Switch to edit mode
                                >
                                    {text || <span className="text-gray-500">Click to edit</span>}
                                </div>*/
                <div className="flex items-center space-x-2">
                    <h2 className="text-2xl font-bold text-white truncate">
                        {text}
                    </h2>
                    <PencilIcon
                        className={`w-5 h-5 ${canEdit ? 'text-gray-400 cursor-pointer hover:text-gray-200' : 'text-gray-600'}`}
                        onClick={handleEdit}
                    />
                </div>
            )}
        </div>
    );
};

export default EditableText;