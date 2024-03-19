import Head from "next/head";
import TopNav from "../components/TopNav";
import Footer from "../components/Footer";
import { useState, useEffect } from "react";

import { connect } from "react-redux";

import { useSelector } from "react-redux";
import MapPage from "../components/MapPage";
import { getDocs, collection, query, orderBy } from "firebase/firestore";
import { db } from "../config/FirebaseConfig";
import StatCard from "../components/StatCard";
import _ from "lodash";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import IconButton from "@mui/material/IconButton";
import Loader from "../components/Loader";

const defaultStyle = "flex flex-col min-h-screen justify-center items-center ";

function Home(props) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedList, setPaginatedList] = useState([]);

  useEffect(() => {
    try {
      const fetchSessions = async () => {
        setData([]);
        const colRef = collection(db, "reports");
        const q = query(colRef, orderBy("date", "asc"));
        const querySnapshot = await getDocs(q);
        const filterData = async (querySnapshot) => {
          querySnapshot.forEach((doc) => {
            setData((prevItem) => [...prevItem, doc.data()]);
          });
        };
        await filterData(querySnapshot);
        setIsLoading(false);
      };

      fetchSessions();
    } catch (error) {
      alert(error);
    }
  }, [added]);

  useEffect(() => {
    setPaginatedList(_(data)?.slice(0).take(pageSize).value());
  }, [data]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const paginated = _(data)?.slice(startIndex).take(pageSize).value();
    setPaginatedList(paginated);
  }, [currentPage, data]);

  const pageSize = 5;

  const pageCount = data ? Math.ceil(data.length / pageSize) : 0;

  const pages = _.range(1, pageCount + 1);

  const paginationNext = () => {
    if (currentPage < pages.length) {
      setCurrentPage((prevValue) => prevValue + 1);
    }
  };

  const paginationPrevious = () => {
    if (currentPage > 1) {
      setCurrentPage((prevValue) => prevValue - 1);
    }
  };

  return (
    <div
      className={
        defaultStyle +
        "bg-gradient-to-t from-black via-gray-700 to-black bg-cover bg-fixed"
      }
    >
      <Head>
        <title>Magnify 🔎</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
        <link
          href="https://api.mapbox.com/mapbox-gl-js/v2.8.1/mapbox-gl.css"
          rel="stylesheet"
        />
      </Head>
      <header className="w-full sticky top-0 z-10">
        <TopNav />
      </header>

      <div className="flex justify-center items-center h-screen  w-full">
        {isLoading ? (
          <Loader />
        ) : (
          <>
            <div className="w-[20%] h-full min-h-screen relative flex p-4 pb-10 flex-col justify-start overflow-auto items-center">
              {paginatedList?.map((item, index) => {
                return (
                  <StatCard
                    key={index}
                    title={item.title}
                    img={item.img}
                    date={item.date}
                    type={item.type}
                  />
                );
              })}
              {paginatedList.length != 0 && (
                <div className="flex justify-center absolute bottom-0  items-center mt-6 space-x-4">
                  <IconButton
                    className="text-slate-400"
                    onClick={paginationPrevious}
                  >
                    <NavigateBeforeIcon
                      className="text-slate-400 hover:text-white "
                      sx={{ width: 35, height: 35 }}
                    />
                  </IconButton>
                  <p className="text-white text-semibold">{currentPage}</p>
                  <IconButton
                    className="text-slate-400 "
                    onClick={paginationNext}
                  >
                    <NavigateNextIcon
                      className="text-slate-400 hover:text-white "
                      sx={{ width: 35, height: 35 }}
                    />
                  </IconButton>
                </div>
              )}
            </div>
            <div className="w-[80%] h-full flex flex-col justify-center items-center">
              <MapPage items={data} change={setAdded} />
            </div>
          </>
        )}
      </div>

      <footer className="w-full">
        <Footer />
      </footer>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    currentUser: state.user,
    mode: state.mode,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setMode: () => dispatch({ type: "SET_MODE" }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
