const Loading = () => {
  return (
    <div className="flex justify-center items-center my-24">
      <div className="animate-spin" style={{ width: '48px', height: '48px' }}>
        <img src="/favicon.ico" alt="Loading..." className="w-full h-full" />
      </div>
    </div>
  );
};

export default Loading;
