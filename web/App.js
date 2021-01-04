import React, { useState, useEffect } from "react";
import styled from "styled-components";
import "date-fns";
import { format } from "date-fns";
import DateFnsUtils from "@date-io/date-fns";
import addMonths from "date-fns/addMonths";
import Select from "@material-ui/core/Select";
import FormControl from "@material-ui/core/FormControl";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import Button from "@material-ui/core/Button";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import axios from "axios";

import PhoneNumberMask from "./PhoneNumberMask";

const PageWrapper = styled("div")`
  margin: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: "Roboto";
`;

const Selectors = styled("div")`
  display: flex;
  flex-direction: row;
  border-bottom: 1px solid #ccc !important;
`;

const Selector = styled("div")`
  margin-top: 16px;
  margin-left: 8px;
  margin-bottom: 12px;
  min-width: 120px;
`;

const Availability = styled("div")`
  border-bottom: 1px solid #ccc !important;
  margin: 16px;
`;

const Subscribe = styled("div")``;

const DotWrapper = styled('span')`
  vertical-align: middle;
`;

const GreenDot = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 31 31"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="15.5" cy="15.5" r="15.5" fill="#3EDB4E" fill-opacity="0.9" />
  </svg>
);

const GreyDot = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 31 31"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="15.5" cy="15.5" r="15.5" fill="#959995" fill-opacity="0.9" />
  </svg>
);

export default function App() {
  const [startDate, setStartDate] = useState(format(new Date(), "MM/dd/yyyy"));
  const [resort, setResort] = useState("");
  const [resortList, setResortList] = useState([]);
  const [phoneNumber, setphoneNumber] = useState("(   )    -    ");
  const [isAvailable, setIsAvailable] = useState(false);
  const [phoneNumberErrorText, setPhoneNumberErrorText] = useState();
  const maxDate = addMonths(new Date(), 3);

  useEffect(() => {
    try {
      axios("http://localhost:3000/resort-list").then((res) => {
        setResortList(res.data);
      });
    } catch (e) {
      console.log(e);
    }
  }, [setResortList]);

  useEffect(() => {
    if (startDate && resort) {
      try {
        axios(
          `http://localhost:3000/availability/${resort}?date=${startDate}`
        ).then((res) => {
          setIsAvailable(res.data > 0);
        });
      } catch (e) {
        console.log(e);
      }
    }
  }, [resort, startDate, setIsAvailable]);

  const handleDateChange = (date) => {
    setStartDate(format(date, "MM/dd/yyyy"));
  };

  const handlePhoneNumberChange = (e) => {
    setphoneNumber(e.target.value);
    setPhoneNumberErrorText(undefined);
  };

  let availability;

  if (isAvailable) {
    availability = <p>Current Availability: <DotWrapper>{GreenDot}</DotWrapper> (tickets available)</p>;
  } else {
    availability = (
      <p>Current Availability: <DotWrapper>{GreyDot}</DotWrapper> (no tickets remaining)</p>
    );
  }

  return (
    <PageWrapper>
      <h1>Ski Ticket Monitor</h1>
      <i>Go Skiing Every Weekend</i>
      <Selectors>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDatePicker
            disableToolbar
            variant="inline"
            format="MM/dd/yyyy"
            margin="normal"
            id="date-picker-inline"
            label="Day On The Slope"
            value={startDate}
            onChange={handleDateChange}
            KeyboardButtonProps={{
              "aria-label": "change date",
            }}
            maxDate={maxDate}
            fullWidth
            disablePast
          />
        </MuiPickersUtilsProvider>
        <Selector>
          <FormControl fullWidth disabled={resortList.length === 0}>
            <InputLabel id="demo-simple-select-label">Resort</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={resort}
              onChange={(event) => setResort(event.target.value)}
            >
              {resortList.map((resort, index) => (
                <MenuItem value={resort} key={index}>
                  {resort}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Selector>
      </Selectors>
      <Availability>{availability}</Availability>
      <Subscribe>
        <h3>SMS Notification</h3>
        <FormControl
          fullWidth
          error={!!phoneNumberErrorText}
          margin="dense"
          variant="outlined"
        >
          <InputLabel htmlFor="formatted-text-mask-input">
            phone number
          </InputLabel>
          <OutlinedInput
            autoFocus={true}
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            id="formatted-text-mask-input"
            inputComponent={PhoneNumberMask}
            label="phone number"
          />
          {phoneNumberErrorText && (
            <FormHelperText id="component-error-text">
              {phoneNumberErrorText}
            </FormHelperText>
          )}
        </FormControl>
        <Button variant="contained" color="primary">
          Subscribe
        </Button>
      </Subscribe>
    </PageWrapper>
  );
}
