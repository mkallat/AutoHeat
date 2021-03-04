from flask import Flask, request, Response, jsonify
from flask_cors import CORS
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
import datetime
import json
import set
import control

app = Flask(__name__)
CORS(app)

# Timer class for event scheduling
class Timer:
    def __init__(self):
        self.timer = BackgroundScheduler(daemon=True)
        self.timer.start()
        self.start = False

    
    def setTimer(self, time):
        print('Starting time: ' + time.strftime("%m/%d/%Y, %H:%M:%S"))

        if self.start is False:
            self.start = True
        else:
            self.timer.remove_all_jobs()
        
        self.timer.add_job(control.switch, 'date', run_date=time, misfire_grace_time=7200, args=[True])


@app.route('/set-time')
def set_time():
    year = int(request.args.get('year'))
    month = int(request.args.get('month'))
    day = int(request.args.get('day'))

    hour = int(request.args.get('hour'))
    minute = int(request.args.get('minute'))

    date = datetime.datetime(year=year, month=month, day=day, hour=hour, minute=minute)
    start = set.calculateHeatTime(date)

    print(datetime.datetime.now())
    print(start)

    data = {'start time':[{
        'year': start.year,
        'month': start.month,
        'day': start.day,
        'hour': start.hour,
        'minute': start.minute
    }], 'departure time': date.strftime("%d.%m.%Y, klo %H:%M"),
        'weather': set.getCurrentWeather(),
        'hours': set.getTime()}

    with open('time.json', 'w') as outfile:
        json.dump(data, outfile)

    timer.setTimer(start)

    return {"msg": "OK"}, 201


@app.route('/get-time-remaining')
def get_time():
    with open('time.json') as json_file:
        data = json.load(json_file)

        remaining = datetime.datetime(year=data['start time'][0]['year'], month=data['start time'][0]['month'], day=data['start time'][0]['day'], hour=data['start time'][0]['hour'], minute=data['start time'][0]['minute'])
        current = datetime.datetime.now()

        print(current)
        print(remaining)

        if (current < remaining):
            return jsonify({"remaining": {"minutes": (remaining-current).seconds/60}, "departure": data['departure time'], "weather": data["weather"], "time": data["hours"], "running": control.getStatus()})
        else:
            return jsonify({"remaining": {"minutes": 0}, "weather": data["weather"], "time": data["hours"], "running": control.getStatus()})


@app.route('/turn-off')
def turn_off():
    control.switch(False)
    return {"msg": "Turn Off OK"}, 201
      
       
if __name__ == "__main__":
    timer = Timer()

    update = BackgroundScheduler()
    update.add_job(set.updateWeather, 'interval', hours=1)
    update.start()

    app.run(host="0.0.0.0")