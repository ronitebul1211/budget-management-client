import React from "react";
import "./TransactionForm.css";
import dates from "../../utils/dates";
import { netReqAction, formMode, formControllerAction } from "../../utils/constants";
import PropTypes from "prop-types";
import InputField from "../_InputFields/InputField";
import RadioField from "../_InputFields/RadioField";
import SelectField from "../_InputFields/SelectField";
import Button from "../_Buttons/Button";

//TODO: Auto focus when open on first input

/** Prop Types at the end of the file */
class TransactionForm extends React.Component {
   state = {
      _id: "",
      description: "",
      type: "",
      totalPayment: "",
      paymentMethod: "",
      date: "",
      category: "",
      errors: {
         descriptionInputError: false,
         totalPaymentInputError: false,
      },
   };

   componentDidMount() {
      const initialFormState = this.props.transactionData;
      this.setState({ ...initialFormState });
   }

   onInputChange = (event) => {
      const target = event.target;
      //Hide error from the input field when input changed
      if (
         (target.name === "description" && this.state.errors.descriptionInputError) ||
         (target.name === "totalPayment" && this.state.errors.totalPaymentInputError)
      ) {
         return this.setState((prevState) => ({
            [target.name]: target.value,
            errors: {
               ...prevState.errors,
               [`${target.name}InputError`]: false,
            },
         }));
      }

      this.setState({ [target.name]: target.value });
   };

   onButtonClick = (action) => {
      switch (action) {
         case formControllerAction.CLOSE_FORM:
            this.props.onEventCallback(action);
            break;
         case netReqAction.CREATE_TRANSACTION_ENDPOINT:
         case netReqAction.UPDATE_TRANSACTION_ENDPOINT:
            if (this.validateForm()) {
               const transactionData = { ...this.state };
               delete transactionData.errors;
               this.props.onEventCallback(action, transactionData);
            }
            break;
         default:
            throw Error("Invalid action");
      }
   };

   /** Validate form input fields, in case of errors set specific error in the component state
    * @returns {boolean} represents the status of the whole form validation
    */
   validateForm = () => {
      //Payment Valid Input: positive integer
      const totalPaymentInput = parseInt(this.state.totalPayment);
      const totalPaymentInputError = isNaN(totalPaymentInput) || totalPaymentInput < 1;
      //Description Valid Input: string contain min 1 character
      const descriptionInput = this.state.description.trim();
      const descriptionInputError = descriptionInput < 1;
      this.setState({ errors: { totalPaymentInputError, descriptionInputError } });
      return !totalPaymentInputError && !descriptionInputError;
   };

   renderTitleText = (mode) => {
      switch (mode) {
         case formMode.CREATE_TRANSACTION:
            return "הוסף פעילות";
         case formMode.EDIT_TRANSACTION:
            return "ערוך פעילות";
         default:
         // throw Error("Invalid form mode");
      }
   };

   renderSuccessBtnText = (mode) => {
      switch (mode) {
         case formMode.CREATE_TRANSACTION:
            return "הוסף";
         case formMode.EDIT_TRANSACTION:
            return "שמור";
         default:
            console.log(mode);
         // throw new Error("Invalid form mode");
      }
   };

   render() {
      const { mode } = this.props;
      return (
         <div className="form">
            <div className="form__content-container">
               <span className="form__title">{this.renderTitleText(mode)}</span>
               <RadioField
                  selectedValue={this.state.type}
                  content={{
                     label: "סוג",
                     options: [
                        { label: "חובה", value: "debit" },
                        { label: "זכות", value: "credit" },
                     ],
                  }}
                  config={{
                     inputName: "type",
                     defaultValue: "חובה",
                     displayMode: { field: "column", options: "row" },
                  }}
                  onChangeCallback={this.onInputChange}
               />
               <InputField
                  value={this.state.description}
                  config={{ label: "תיאור", name: "description", type: "text", displayMode: "column" }}
                  error={{ message: "הכנס תיאור", isDisplayed: this.state.errors.descriptionInputError }}
                  onChangeCallback={this.onInputChange}
               />
               <InputField
                  value={this.state.totalPayment}
                  config={{
                     label: "סכום",
                     name: "totalPayment",
                     displayMode: "column",
                     type: "number",
                  }}
                  error={{
                     message: "הכנס מספר חיובי שלם",
                     isDisplayed: this.state.errors.totalPaymentInputError,
                  }}
                  onChangeCallback={this.onInputChange}
               />
               <InputField
                  value={this.state.date}
                  config={{
                     label: "תאריך",
                     name: "date",
                     type: "date",
                     displayMode: "column",
                     limitMin: dates.getDateInIsoFormat("firstDayOfCurrentMonth"),
                     limitMax: dates.getDateInIsoFormat("lastDayOfCurrentMonth"),
                  }}
                  onChangeCallback={this.onInputChange}
               />
               <SelectField
                  value={this.state.paymentMethod}
                  options={[
                     { label: "מזומן", value: "מזומן" },
                     { label: "אשראי", value: "אשראי" },
                     { label: 'עו"ש', value: 'עו"ש' },
                  ]}
                  config={{ fieldLabel: "אמצעי תשלום", inputName: "paymentMethod", displayMode: "column" }}
                  onChangeCallback={this.onInputChange}
               />
               <SelectField
                  value={this.state.category}
                  options={[
                     { label: "חשבונות", value: "חשבונות" },
                     { label: "קניות לבית", value: "קניות לבית" },
                     { label: "בילויים", value: "בילויים" },
                     { label: "אוכל בחוץ", value: "אוכל בחוץ" },
                     { label: "חיות מחמד", value: "חיות מחמד" },
                  ]}
                  config={{ fieldLabel: "קטגוריה", inputName: "category", displayMode: "column" }}
                  onChangeCallback={this.onInputChange}
               />
            </div>
            <div className="form__btn-container">
               <Button
                  text="חזור"
                  displayMode="danger"
                  clickHandlerCallback={() => {
                     this.onButtonClick(formControllerAction.CLOSE_FORM);
                  }}
               />
               <Button
                  text={this.renderSuccessBtnText(mode)}
                  displayMode="success"
                  clickHandlerCallback={() => {
                     this.onButtonClick(
                        (mode === formMode.CREATE_TRANSACTION && netReqAction.CREATE_TRANSACTION_ENDPOINT) ||
                           (mode === formMode.EDIT_TRANSACTION && netReqAction.UPDATE_TRANSACTION_ENDPOINT),
                     );
                  }}
               />
            </div>
         </div>
      );
   }
}

TransactionForm.propTypes = {
   mode: PropTypes.oneOf([formMode.CREATE_TRANSACTION, formMode.EDIT_TRANSACTION]).isRequired,
   transactionData: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      totalPayment: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      date: PropTypes.string.isRequired,
      paymentMethod: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
   }).isRequired,
   onEventCallback: PropTypes.func.isRequired,
};
export default TransactionForm;
