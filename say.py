#!/usr/bin/env python3

import wave, turtle
from math import gcd
from sys import platform
from subprocess import run

RATE = 44100

"""
Converts a sequence of floats in the range [0, 1] to a bytestring
suitable for writing to a .wav file.
"""
def get_bytes(sound):
    signal = bytearray()
    for s in sound:
#        try:
#            signal.append(int(s * 127) + (256 if int(s * 127) < 0 else 0))
#        except ValueError:
#            print(int(s * 127) + (256 if int(s * 127) < 0 else 0))
#            raise ValueError
        signal += wave.struct.pack('h', int(32767*s))
    return signal

"""Writes a sound to a .wav file."""
def write_file(sound, filename, framerate=44100):
    w = wave.open(filename, 'wb')
    # (number of channels, samplewidth in bytes, framerate, number of frames, compression type, compression name)
    w.setparams((1, 1, framerate, len(sound), 'NONE', 'noncompressed'))
    signal = get_bytes(sound)
    w.writeframes(signal)
    w.close()
    return signal

"""Draws values on a turtle window"""
def draw(vals):
    s = turtle.Screen()
    t = turtle.RawTurtle(s)
    s.tracer(0)
    t.pu()
    t.hideturtle()
    t.color([0,0,0])
    for i in range(len(vals)):
        t.goto(i / RATE * 1800 - 900, vals[i] * 1000 - 500)
        t.dot(2)
        s.update()
    input()

def combine(a, b):
    return [a[0] + b[0], a[1] + b[1]]

"""start with an array of all 0's, then incrementally increase it to be thomae's function by stepping through q"""
def tree(arr, maxq, x=[1, 2], l=[0, 1], r=[1, 1]):
    if x[1] > maxq:
        return
    i = len(arr) * x[0] / x[1]
    y = x[1] / maxq
    arr[int(i)] += y * (i % 1)
    arr[int(i)+1] += y * (1 - i % 1)
    tree(arr, maxq, combine(x, l), l, combine(r, l))
    tree(arr, maxq, combine(x, r), combine(l, r), r)

"""creates Thomae's function as a .wav file"""
def sound(
    width = 60, # length in seconds of the output
    zoom = 0, # frequency in hertz of the unit pulse
    maxq = 1000, # denominator upper limit
    vol = 1 # multiplier for volume
    ):
    if zoom == 0:
        zoom = 1/width
    sound = [0] * int(RATE * width + 1) # samples / second * seconds
    if True:
        q = 0
        while q < maxq:
            q += 1
            p = 0
            while p < q * width * zoom:
                if gcd(p,q) == 1:
                    x = p * RATE / (q * zoom)
                    # rounding
    #                sound[int(x)] -= q
                    # weighted balancing
                    sound[int(x - RATE * width)] -= q * (1 - x % 1)
                    if x % 1 > 0:
                        sound[int(x+1)] -= q * (x % 1)
                    # truncating
    #                if x % 1 == 0:
    #                    sound[int(x)] += 1/q
                p += 1
    else:
        tree(sound, maxq)
    m = -min(sound)
    print(m)
#    for i in range(len(sound)):
#        sound[i] = (sound[i] + m) * vol / m
    write_file(sound, "sound2.wav", framerate=RATE)
    print(max(sound))
#    run(["ffplay", "-fs", "-noborder", "-autoexit", "-loglevel", "8", "sound.wav"])

if __name__ == "__main__":
    sound()
