const Input = ({icon:Icon, ...props}) => {
  return (
    <div className="relative mb-6">
        <div className="absolute inset-y-0 flex left-0 pl-3 items-center pointer-events-none">
            <Icon className="size-5 text-green-500"/>
        </div>
        <input {...props} className="w-full pl-10 pr-3 py-2 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700 text-white placeholder-gray-400 transition duration-200 focus:ring-2 focus:border-green-500 focus:ring-green-500" />
    </div>
  )
}

export default Input;