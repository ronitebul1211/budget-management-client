import { useEffect, useState, useRef, useReducer } from "react";
import transactionsApi from "../../utils/transactionsApi";
import { netReqAction } from "../../utils/constants";

const networkReducer = (state, action) => {
   switch (action.type) {
      case "NETWORK_TRANSACTION_INIT":
         return {
            ...state,
            isLoading: true,
            isError: false,
         };
      case "NETWORK_TRANSACTION_SUCCESS":
         return {
            monthData: action.payload,
            isLoading: false,
            isError: false,
         };
      case "NETWORK_TRANSACTION_FAILURE":
         return {
            ...state,
            isLoading: false,
            isError: true,
         };
      default:
         throw new Error("Invalid action in network reducer");
   }
};

const useTransactionsApi = (config) => {
   const configRef = useRef(config);

   const [state, dispatch] = useReducer(networkReducer, {
      monthData: configRef.current.defaultState,
      isLoading: false,
      isError: false,
   });

   const [isMonthDataUpdatedNew, setIsMonthDataUpdated] = useState(false);
   const [networkRequest, setNetworkRequest] = useState({ type: null, payload: null });

   useEffect(() => {
      const sendRequest = async () => {
         dispatch({ type: "NETWORK_TRANSACTION_INIT" });
         try {
            switch (networkRequest.type) {
               case netReqAction.FETCH_TRANSACTIONS_ENDPOINT:
                  let monthData = {};
                  //TODO: test -> don't use if else..
                  if (networkRequest.payload) {
                     monthData = await fetchMonthData(networkRequest.payload);
                  } else {
                     monthData = await fetchMonthData();
                  }
                  dispatch({ type: "NETWORK_TRANSACTION_SUCCESS", payload: monthData });
                  setIsMonthDataUpdated(true);
                  break;
               case netReqAction.CREATE_TRANSACTION_ENDPOINT:
                  await transactionsApi.postTransaction(networkRequest.payload);
                  setIsMonthDataUpdated(false);
                  break;
               case netReqAction.UPDATE_TRANSACTION_ENDPOINT:
                  await transactionsApi.updateTransaction(networkRequest.payload);
                  setIsMonthDataUpdated(false);
                  break;
               case netReqAction.DELETE_TRANSACTION_ENDPOINT:
                  await transactionsApi.deleteTransaction(networkRequest.payload);
                  setIsMonthDataUpdated(false);
                  break;
               default:
                  throw new Error("Network request set with invalid action type");
            }
         } catch (err) {
            if (err.isAxiosError) {
               dispatch({ type: "NETWORK_TRANSACTION_FAILURE" });
            } else {
               throw err;
            }
         }
      };
      if (networkRequest.type) {
         sendRequest();
         setNetworkRequest({ type: null, payload: null });
      }
   }, [networkRequest]);

   useEffect(() => {
      if (!isMonthDataUpdatedNew) {
         setNetworkRequest({ type: netReqAction.FETCH_TRANSACTIONS_ENDPOINT });
      }
   }, [isMonthDataUpdatedNew]);

   /**
    * Fetch month data: transactions list, metadata ("monthStatus" / "debitDistribution" / "")
    * @param {object} date -requested month {month: {number}, year: {number}}
    * when date is not supplied, fetch current month transactions
    */
   const fetchMonthData = async (date) => {
      const { fetchQuery, defaultState } = configRef.current;
      const res = await transactionsApi.getMonthData(fetchQuery, date);
      if (res.status === 204) {
         return defaultState;
      }
      const { metadata, transactionsList } = res.data;
      return { transactionsList: transactionsList.data, metadata };
   };

   return [state, setNetworkRequest];
};

export default useTransactionsApi;
