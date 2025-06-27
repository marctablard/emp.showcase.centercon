interface ProductCharacteristicProps {
  value: string | number;
  unit: string;
}

export function ProductCharacteristic({ value, unit }: ProductCharacteristicProps) {
  return (
    <div className="w-10 h-10 border rounded-sm overflow-hidden">
      <div className="text-sm flex justify-center bg-neutral-900 text-white ">{value}</div>
      <div className="text-sm flex justify-center bg-white">{unit}</div>
    </div>
  );
}
