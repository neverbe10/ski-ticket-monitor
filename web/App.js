import React, { useState, useEffect, useRef } from "react";
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

function Donate() {
  const ref = useRef();
  useEffect(() => {
    if (ref && ref.current) {
      const button = document.getElementById("buymeacoffee");
      button.style.display = "";
      ref.current.appendChild(button);
    }
  }, [ref]);

  return <div ref={ref} />;
}

export default function App() {
  const [choosenDate, setChoosenDate] = useState(
    format(new Date(), "MM/dd/yyyy")
  );
  const [resort, setResort] = useState("");
  const [resortList, setResortList] = useState([]);
  const [phoneNumber, setphoneNumber] = useState("(   )    -    ");
  const [isAvailable, setIsAvailable] = useState(false);
  const [resortUrl, setResortUrl] = useState("");
  const [phoneNumberErrorText, setPhoneNumberErrorText] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const maxDate = addMonths(new Date(), 3);

  useEffect(() => {
    try {
      axios("/resort-list").then((res) => {
        setResortList(res.data);
      });
    } catch (e) {
      console.log(e);
    }
  }, [setResortList]);

  useEffect(() => {
    if (choosenDate && resort) {
      try {
        axios(
          `/availability/${resort}?date=${choosenDate}`
        ).then((res) => {
          setIsAvailable(res.data.remaining > 0);
          setResortUrl(res.data.resortUrl);
        });
      } catch (e) {
        console.log(e);
      }
    }
  }, [resort, choosenDate, setIsAvailable]);

  const handleDateChange = (date) => {
    console.log({ date });
    setChoosenDate(format(date, "MM/dd/yyyy"));
  };

  const handlePhoneNumberChange = (e) => {
    setphoneNumber(e.target.value);
    setPhoneNumberErrorText(undefined);
  };

  const handleSubscribe = async () => {
    if (phoneNumber && choosenDate && resort) {
      if (!isLoading) {
        setIsLoading(true);
        await axios.post(`/subscribe`, {
          phoneNumber,
          choosenDate,
          resort,
        });
        setIsLoading(false);
      }
    }
  };

  let availability;

  console.log({
    choosenDate,
    resort,
    isAvailable,
    isLoading,
    choosenDate,
  });

  if (!choosenDate || !resort) {
    availability = (
      <Availability>
        <DisabledText>Current Availability: - - - - - - - - - </DisabledText>
      </Availability>
    );
  } else if (isAvailable) {
    availability = (
      <Availability>
        <p>
          Current Availability: <DotWrapper>{GreenDot}</DotWrapper>
          {` `}(tickets available)
        </p>
        <i>
          Get Tickt: <a href={resortUrl}>here</a>
        </i>
      </Availability>
    );
  } else {
    availability = (
      <Availability>
        <p>
          Current Availability: <DotWrapper>{GreyDot}</DotWrapper>
          {` `}(no tickets remaining)
        </p>
        <i>*Sign Up for Notification Below</i>
      </Availability>
    );
  }

  return (
    <PageWrapper>
      <Donate />
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
            value={choosenDate}
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
      {availability}
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
        <Button
          variant="contained"
          color={"primary"}
          disabled={isLoading}
          onClick={handleSubscribe}
        >
          Subscribe
        </Button>
      </Subscribe>
      <i>*This website is not run by or affiliated with Vail Resorts</i>
    </PageWrapper>
  );
}

const PageWrapper = styled("div")`
  margin: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: "Roboto";
  > div:first-child {
    position: absolute;
    top: 32px;
    right: 16px;
  }
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
  display: flex;
  align-items: center;
  min-height: 80px;
  flex-direction: column;
  justify-content: center;
  i {
    font-size: 12px;
  }
  p {
    margin: 8px 0;
  }
`;

const Subscribe = styled("div")`
  margin-bottom: 12px;
`;

const DotWrapper = styled("span")`
  vertical-align: middle;
`;

const DisabledText = styled("p")`
  :hover {
    cursor: not-allowed;
  }
  color: grey;
`;