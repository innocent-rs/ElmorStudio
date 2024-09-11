import "./App.css";
import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import Tabs from "./Tabs.tsx";
function App() {
    return (
        <DndProvider backend={HTML5Backend}>
            <div className="bg-gray-900 text-white min-h-screen flex">
                <Tabs />
            </div>
        </DndProvider>
    );
}

export default App;
