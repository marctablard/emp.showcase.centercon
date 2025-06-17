export default function ColorStyleGuide() {
  return (
    <div className="py-12">
      <h4 className="text-3xl/5 lg:text-4xl font-bold text-headlines font-headlines mb-3">Colors</h4>
      <div className="p-4 flex flex-wrap gap-4 mb-2">
        <div className="p-4 bg-primary-900 text-white">primary-900</div>
        <div className="p-4 bg-primary-800 text-white">primary-800</div>
        <div className="p-4 bg-primary-700 text-white">primary-700</div>
        <div className="p-4 bg-primary-600 text-white">primary-600</div>
        <div className="p-4 bg-primary-500 text-white">primary-500</div>
        <div className="p-4 bg-primary-400 text-white">primary-400</div>
        <div className="p-4 bg-primary-300 text-white">primary-300</div>
        <div className="p-4 bg-primary-200">primary-200</div>
        <div className="p-4 bg-primary-100">primary-100</div>
        <div className="p-4 bg-primary-50">primary-50</div>
      </div>
      <div className="p-4 flex flex-wrap gap-4 mb-2">
        <div className="p-4 bg-secondary-900 text-white">secondary-900</div>
        <div className="p-4 bg-secondary-800 text-white">secondary-800</div>
        <div className="p-4 bg-secondary-700 text-white">secondary-700</div>
        <div className="p-4 bg-secondary-600 text-white">secondary-600</div>
        <div className="p-4 bg-secondary-500">secondary-500</div>
        <div className="p-4 bg-secondary-400">secondary-400</div>
        <div className="p-4 bg-secondary-300">secondary-300</div>
        <div className="p-4 bg-secondary-200">secondary-200</div>
        <div className="p-4 bg-secondary-100">secondary-100</div>
      </div>
      <div className="p-4 flex flex-wrap gap-4 mb-2">
        <div className="p-4 bg-tertiary-900 text-white">tertiary-900</div>
        <div className="p-4 bg-tertiary-800 text-white">tertiary-800</div>
        <div className="p-4 bg-tertiary-700 text-white">tertiary-700</div>
        <div className="p-4 bg-tertiary-600 text-white">tertiary-600</div>
        <div className="p-4 bg-tertiary-500">tertiary-500</div>
        <div className="p-4 bg-tertiary-400">tertiary-400</div>
        <div className="p-4 bg-tertiary-300">tertiary-300</div>
        <div className="p-4 bg-tertiary-200">tertiary-200</div>
        <div className="p-4 bg-tertiary-100">tertiary-100</div>
      </div>
      <div className="p-4 flex flex-wrap gap-4 mb-2">
        <div className="p-4 bg-success-900 text-white">success-900</div>
        <div className="p-4 bg-success-800 text-white">success-800</div>
        <div className="p-4 bg-success-700 text-white">success-700</div>
        <div className="p-4 bg-success-600 text-white">success-600</div>
        <div className="p-4 bg-success-500 text-white">success-500</div>
        <div className="p-4 bg-success-400">success-400</div>
        <div className="p-4 bg-success-300">success-300</div>
        <div className="p-4 bg-success-200">success-200</div>
        <div className="p-4 bg-success-100">success-100</div>
      </div>
      <div className="p-4 flex flex-wrap gap-4 mb-2">
        <div className="p-4 bg-warning-900 text-white">warning-900</div>
        <div className="p-4 bg-warning-800 text-white">warning-800</div>
        <div className="p-4 bg-warning-700 text-white">warning-700</div>
        <div className="p-4 bg-warning-600 text-white">warning-600</div>
        <div className="p-4 bg-warning-500 text-white">warning-500</div>
        <div className="p-4 bg-warning-400">warning-400</div>
        <div className="p-4 bg-warning-300">warning-300</div>
        <div className="p-4 bg-warning-200">warning-200</div>
        <div className="p-4 bg-warning-100">warning-100</div>
      </div>
      <div className="p-4 flex flex-wrap gap-4 mb-2">
        <div className="p-4 bg-danger-900 text-white">danger-900</div>
        <div className="p-4 bg-danger-800 text-white">danger-800</div>
        <div className="p-4 bg-danger-700 text-white">danger-700</div>
        <div className="p-4 bg-danger-600 text-white">danger-600</div>
        <div className="p-4 bg-danger-500 text-white">danger-500</div>
        <div className="p-4 bg-danger-400">danger-400</div>
        <div className="p-4 bg-danger-300">danger-300</div>
        <div className="p-4 bg-danger-200">danger-200</div>
        <div className="p-4 bg-danger-100">danger-100</div>
      </div>
      <div className="p-4 flex flex-wrap gap-4 mb-2">
        <div className="p-4 bg-neutral-900 text-white">neutral-900</div>
        <div className="p-4 bg-neutral-800 text-white">neutral-800</div>
        <div className="p-4 bg-neutral-700 text-white">neutral-700</div>
        <div className="p-4 bg-neutral-600 text-white">neutral-600</div>
        <div className="p-4 bg-neutral-500 text-white">neutral-500</div>
        <div className="p-4 bg-neutral-400 text-white">neutral-400</div>
        <div className="p-4 bg-neutral-300 text-white">neutral-300</div>
        <div className="p-4 bg-neutral-200">neutral-200</div>
        <div className="p-4 bg-neutral-100">neutral-100</div>
        <div className="p-4 bg-neutral-50">neutral-50</div>
      </div>
      <p className="font-bold">Gradient:</p>
      <div className="p-4 flex flex-wrap gap-4 mb-2">
        <div className="p-8 bg-gradient-to-t from-primary-700 to-primary-500 text-white">
          primary-700 to primary-500
        </div>
        <div className="p-8 bg-gradient-to-t from-secondary-500 to-primary-500 font-bold">
          secondary-500 to primary-500
        </div>
      </div>
    </div>
  );
}
