const Ido = () => {
  return (
    <div className="container mx-auto py-20 px-4">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-24 h-24 mb-8 relative">
          <svg
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="5273"
            width="100%"
            height="100%"
          >
            <path
              d="M864 96H160c-52.8 0-96 43.2-96 96v640c0 52.8 43.2 96 96 96h704c52.8 0 96-43.2 96-96V192c0-52.8-43.2-96-96-96z m-416 64h128v64H448v-64z m-192 0h128v64H256v-64z m640 672c0 17.6-14.4 32-32 32H160c-17.6 0-32-14.4-32-32V384h768v448z m0-512H128v-32c0-17.6 14.4-32 32-32h32v64h64v-64h128v64h64v-64h128v64h64v-64h128v64h64v-64h32c17.6 0 32 14.4 32 32v32z"
              fill="#0e932e"
              p-id="5274"
            ></path>
          </svg>
        </div>
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-500 to-emerald-600 text-transparent bg-clip-text">
          Initial DEX Offering
        </h1>
        <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-emerald-600 my-4"></div>
        <p className="text-2xl text-gray-600 mb-8">Coming Soon</p>
        <p className="max-w-2xl text-gray-500">
          Our IDO platform is under development. Soon you&apos;ll be able to participate in carefully vetted token launches and get early access to promising projects. Stay tuned for updates!
        </p>
      </div>
    </div>
  );
};

export default Ido;
