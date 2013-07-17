"""
This file is used to store all position matrix demonstrating the layout of canvas on general page
"""

width = 'width'
height = 'height'
left = 'left'
top = 'top'
labelLengthPerLine = 'label_length'

m1 = {
      width : [220,55,55,55,55,110,220],
      height: [160,40,40,40,40,81,160],
      left : [0,221,277,221,277,333,220],
      top : [0,0,0,41,41,0,161],
      labelLengthPerLine : [35, 0, 0, 0, 0, 19, 35]
      }
m2 = {
      width : [220,55,55,55,55,110],
      height: [160,40,40,40,40,81],
      left : [0,221,277,221,277,333],
      top : [0,0,0,41,41,0],
      labelLengthPerLine : [35, 0, 0, 0, 0, 19]
      }
m3 = {
      width : [220,220,110,109,110,112,110,109,110,112],
      height: [160,160,80,80,80,80,80,80,80,80],
      left : [0,221,0,111,221,332,0,111,221,332,],
      top : [0,0,161,161,161,161,242,242,242,242],
      labelLengthPerLine : [35, 35,19,19]
      }

list = [m1,m2,m3]