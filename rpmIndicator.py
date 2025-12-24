from sense_hat import SenseHat;
from time import *
sense = SenseHat()
import random

rpm = 0
#for testing

#colors
white = 255, 255, 255
blank = 0, 0, 0
red = 255, 0 , 0
blue = 0, 0, 255
green = 0, 255, 0
yellow = 255, 150, 0
rpmStatus = ""
rpmControlSignal = "" 
color = white

def setRpmStatus():
    global rpmStatus
    if rpm > 0 and rpm < 2000:
        rpmStatus = "neutral"
    elif rpm > 2000 and rpm < 2500:
        rpmStatus = "ok"
    elif rpm > 2500 and rpm < 3000:
        rpmStatus = "good"
    elif rpm > 3000 and rpm < 3500:
        rpmStatus = "powerband"
    elif rpm > 3500:
        rpmStatus = "over"

def setColor():
    global color
    if rpmStatus == "neutral":
        color = white
    elif rpmStatus == "ok":
        color = blue
    elif rpmStatus == "powerband":
        color = yellow
    elif rpmStatus == "good":
        color = green
    elif rpmStatus == "over":
        color = red


#for testing
def rpmControl():
    global rpm
    if rpmControlSignal == "increase":
             rpm += 100
    if rpmControlSignal == "decrease":
           rpm -= 100
    if rpmControlSignal == "nothing":
        rpm = rpm
    if rpm < 1:
         rpm = 0
         
       
def rpmIndicator():
    setRpmStatus()
    setColor()
    moduloRpm = rpm % 1000
    if moduloRpm > 0 and moduloRpm < 200:
        for x in range (8):
                sense.set_pixel(x, 7, color)
                for y in range (7):
                    sense.set_pixel(x, y, blank)
        
    
    elif moduloRpm >= 200 and moduloRpm < 300:
        for x in range (8):
                sense.set_pixel(x, 6, color)
                sense.set_pixel(x, 7, color)
                for y in range (6):
                    sense.set_pixel(x, y, blank)

    elif moduloRpm >= 300 and moduloRpm < 400:
        for x in range (8):
                sense.set_pixel(x, 6, color)
                sense.set_pixel(x, 7, color)
                sense.set_pixel(x, 5, color)
                for y in range (5):
                    sense.set_pixel(x, y, blank)

    elif moduloRpm >= 400 and moduloRpm < 500:
        for x in range (8):
                sense.set_pixel(x, 6, color)
                sense.set_pixel(x, 7, color)
                sense.set_pixel(x, 5, color)
                sense.set_pixel(x, 4, color)
                for y in range (4):
                    sense.set_pixel(x, y, blank)

    elif moduloRpm >= 500 and moduloRpm < 600:
        for x in range (8):
                sense.set_pixel(x, 6, color)
                sense.set_pixel(x, 7, color)
                sense.set_pixel(x, 5, color)
                sense.set_pixel(x, 4, color)
                sense.set_pixel(x, 3, color)
                
                for y in range (3):
                    sense.set_pixel(x, y, blank)

    elif moduloRpm >= 600 and moduloRpm < 700:
        for x in range (8):
                sense.set_pixel(x, 6, color)
                sense.set_pixel(x, 7, color)
                sense.set_pixel(x, 5, color)
                sense.set_pixel(x, 4, color)
                sense.set_pixel(x, 3, color)
                sense.set_pixel(x, 2, color)
                
                for y in range (2):
                    sense.set_pixel(x, y, blank)

    elif moduloRpm >= 700 and moduloRpm < 800:
        for x in range (8):
                sense.set_pixel(x, 6, color)
                sense.set_pixel(x, 7, color)
                sense.set_pixel(x, 5, color)
                sense.set_pixel(x, 4, color)
                sense.set_pixel(x, 3, color)
                sense.set_pixel(x, 2, color)
                sense.set_pixel(x, 1, color)
                
                for y in range (1):
                    sense.set_pixel(x, y, blank)

    elif moduloRpm >= 800 and moduloRpm < 1000:
        for x in range (8):
                sense.set_pixel(x, 6, color)
                sense.set_pixel(x, 7, color)
                sense.set_pixel(x, 5, color)
                sense.set_pixel(x, 4, color)
                sense.set_pixel(x, 3, color)
                sense.set_pixel(x, 2, color)
                sense.set_pixel(x, 1, color)
                sense.set_pixel(x, 0, color)
                

def direction():
        global rpmControlSignal
        for event in sense.stick.get_events():
            if event.direction=="up" and event.action=="pressed":
                rpmControlSignal = "increase"
            elif event.direction=="down" and event.action=="pressed":
                rpmControlSignal = "decrease"
            elif event.direction=="middle" and event.action=="pressed":
                rpmControlSignal = "nothing"

                

          

while True:
    direction()
    rpmIndicator()
    rpmControl()
    print(rpm)
    sleep (0.1)
    # Simulate RPM change