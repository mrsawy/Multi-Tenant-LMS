import FullCalendar from "@/components/organs/full-calendar";

const CalenderPage: React.FC = () => {
    return (
        <div className="p-36">
            <FullCalendar
                style={{ height: 800 }}
            />
        </div>
    );
};

export default CalenderPage;