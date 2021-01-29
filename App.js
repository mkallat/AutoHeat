import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';

const serverUrl = "";   // Add the server url here

const AppButton = ({ onPress, title }) => (
  <TouchableOpacity onPress={onPress} style={styles.appButtonContainer}>
    <Text style={styles.appButtonText}>{title}</Text>
  </TouchableOpacity>
);

const DatetimeButton = ({ onPress, title }) => (
  <TouchableOpacity onPress={onPress} style={styles.datetimeButtonContainer}>
    <Text style={styles.datetimeButtonText}>{title}</Text>
  </TouchableOpacity>
);

const Main = (props) => {
  const [time, setTime] = useState(0);
  const [departure, setDeparture] = useState("");
  const [heatTime, setHeatTime] = useState(0);
  const [temp, setTemp] = useState(0);
  const [heat, setHeat] = useState(false);


  const turnOff = () => {
    let url =  serverUrl + 'AutoHeat/turn-off';

    console.log(url);

    axios.get(url)
      .then((response) => {
        console.log(response.status);
      });
  }

  const calculateTime = () => {
    let remaining = time % 60.0;

    if (heat) {
      return (
        <View>
          <Text style={styles.statusText}>Lämmitys on päällä.</Text>
          <Text style={styles.buttons}>
            <AppButton title="Sammuta lämmitys" onPress={() => turnOff()} />
          </Text>
        </View>
      );
    } else if (Math.round(time / 60) > 0) {
      return (
        <View>
          <Text style={styles.statusText}>
            {"\n\n"}
            Lähtöaika: {departure}
            {"\n\n"}
            {Math.round(time / 60) + ' tuntia ja ' + Math.round(time % 60) + ' minuuttia lämmityksen aloitukseen.'}
            {"\n\n"}
          </Text>
        </View>
      );
    } else if (remaining < 1 && remaining > 0) {
      return (
        <View>
          <Text style={styles.statusText}>
            {"\n\n"}
          Lähtöaika: {departure}
            {"\n\n"}
          Alle minuutti lämmityksen aloitukseen.
          {"\n\n"}
          </Text>
        </View>);
    } else if (remaining > 0) {
      return (
        <View>
          <Text style={styles.statusText}>
            {"\n\n"}
            Lähtöaika: {departure}
            {"\n\n"}
            {Math.round(time % 60) + ' minuuttia lämmityksen aloitukseen.'}
            {"\n\n"}
          </Text>
        </View>
      );
    } else {
      return (
        <Text style={styles.statusText}>
          Lämmitystä ei ole ajastettu.
        </Text>);
    }
  };

  var mounted;

  const getRemaining = () => {
    calculateTime();
    axios.get(serverUrl + "AutoHeat/get-time-remaining")
      .then(response => {
        console.log('getting data from axios', response.data['remaining']['minutes']);
        setTimeout(() => {
          if (mounted) {
            setTime(response.data['remaining']['minutes']);
            setDeparture(response.data['departure']);
            setTemp(response.data['weather']);
            setHeatTime(response.data['time']);
            setHeat(response.data['running'])
          }
        }, 2000)
      })
      .catch(error => {
        console.log(error);
      });
  }

  useEffect(() => {
    mounted = true;

    let timer = setInterval(getRemaining, 1000);
    return () => clearInterval(timer)
  }, [])

  return (
    <View>
      <Text style={styles.baseText}>
        AutoHeat
  </Text>
      <Text style={styles.tempText}>
        Ulkona {temp} °C ➜ lämmitysaika {heatTime} tuntia
    </Text>
      <View>
        {calculateTime()}
      </View>
    </View>
  );
};


const GUI = () => {
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const showMode = (currentMode) => {
    setShow(true);
    setMode(currentMode);
  };

  const showDate = (date) => {
    var yyyy = date.getFullYear().toString();
    var mm = (date.getMonth() + 101).toString().slice(-2);
    var dd = (date.getDate() + 100).toString().slice(-2);
    return dd + "." + mm + "." + yyyy;
  };

  const showTime = (date) => {
    var minutes = date.getMinutes();

    if (minutes < 10) minutes = String("0" + minutes);

    return date.getHours() + ":" + minutes;
  };

  const showDatepicker = () => {
    showMode('date');
  };

  const showTimepicker = () => {
    showMode('time');
  };

  const sendTime = () => {
    let url = serverUrl + `AutoHeat/set-time?year=${date.getFullYear().toString()}&month=${(date.getMonth() + 101).toString().slice(-2)}&day=${(date.getDate() + 100).toString().slice(-2)}&hour=${date.getHours().toString()}&minute=${date.getMinutes().toString()}`

    console.log(url);

    axios.get(url)
      .then((response) => {
        console.log(response.status);
      });
  };

  return (
    <View>
      <Text style={styles.infoText}>
        Aseta aika, jolloin autolla lähdetään liikkeelle
  </Text>
      <Text style={styles.buttons}>
        <DatetimeButton title={showDate(date)} onPress={showDatepicker} /> <DatetimeButton title={showTime(date)} onPress={showTimepicker} />
      </Text>

      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode={mode}
          is24Hour={true}
          onChange={onChange}
          style={{ flex: 1 }}
        />
      )}
      <Text style={styles.buttons}>
        <AppButton title="Aseta ajastus" onPress={() => sendTime()} />
      </Text>
    </View>
  );
}


export default function App() {
  return (
    <View style={styles.container}>
      <Main />
      <GUI />
    </View>
  )
}

const styles = StyleSheet.create({
  statuscontainer: {
    flexWrap: 'wrap',
  },

  container: {
    flex: 1,
    backgroundColor: '#348feb',
    alignItems: 'center',
    justifyContent: 'center',
  },

  baseText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 40
  },

  infoText: {
    marginTop: 15,
    marginBottom: 25,
    textAlign: 'center',
    color: '#fff',
    fontSize: 20
  },

  statusText: {
    color: 'yellow',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold'
  },

  tempText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 20,
  },

  datetimeText: {
    marginTop: 15,
    textAlign: 'center',
    color: 'yellow',
    fontWeight: 'bold',
    fontSize: 30
  },

  buttons: {
    textAlign: 'center',
    color: 'lightgreen',
    fontWeight: 'bold',
    fontSize: 20,
    paddingVertical: 20,
    marginTop: 5
  },

  heatStatus: {
    marginTop: 15,
    textAlign: 'center',
    color: 'lightgreen',
    fontWeight: 'bold',
    fontSize: 20,
    paddingVertical: 5
  },

  appButtonContainer: {
    marginTop: 50,
    elevation: 8,
    backgroundColor: "#009688",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12
  },
  
  appButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    alignSelf: "center",
    textTransform: "uppercase"
  },

  datetimeButtonContainer: {
    width: 'auto',
    flexDirection: "row",
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    backgroundColor: "green",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12
  },

  datetimeButtonText: {
    fontSize: 25,
    color: "#fff",
    fontWeight: "bold",
    alignSelf: "center",
    textTransform: "uppercase"
  }
});
