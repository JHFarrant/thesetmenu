const Header = () =>         <div
          id={"header"}
          className="relative flex place-items-center flex-col mb-5"
        >
          <img alt="disc logo" src="/disc.png" width="25" />
          <h1 className={`text-3xl font-semibold text-center`}>My Glasto Set Menu</h1>
          <div>
            <p className={`text-xs text-center opacity-50`}>
              {"Auto discover acts using your spotify history"}
            </p>
          </div>
        </div>


export default Header;
