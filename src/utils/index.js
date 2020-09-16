import format from "date-fns/format";
import moment from "moment";

export const convertDollarsToCents = price => (price * 100).toFixed(0);

export const convertCentsToDollars = price => (price / 100).toFixed(2);

// export const formatProductDate = (date) => format(date, "MM/dd/yyyy");
export const formatProductDate = (date) => moment(date).format("MMM Do YYYY");

export const formatOrderDate = date => format(date, "ddd h:mm A, MMM Do, YYYY");
