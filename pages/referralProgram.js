const ReferralProgram = () => {
  return (
    <>
      <div className="card md:w-3/4 w-96 m-auto">
        <div className="card-body">
          <div className="font-black text-center mt-12">
            Submit Your Leader Address
          </div>
          <input
            type="text"
            placeholder="0x"
            className="input input-bordered w-full"
          />
          <div className="btn btn-primary">Submit</div>
        </div>
      </div>
    </>
  );
};

export default ReferralProgram;
