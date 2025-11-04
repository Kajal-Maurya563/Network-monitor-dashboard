export default function AlertBox({ message }) {
  return (
    <div className="bg-red-700 text-white p-3 rounded-lg text-center font-semibold">
      {message}
    </div>
  );
}