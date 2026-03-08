def pm25_to_aqi(pm25):

    if pm25 <= 30:
        return pm25 * 50/30
    elif pm25 <= 60:
        return 50 + (pm25-30)*(50/30)
    elif pm25 <= 90:
        return 100 + (pm25-60)*(100/30)
    elif pm25 <= 120:
        return 200 + (pm25-90)*(100/30)
    elif pm25 <= 250:
        return 300 + (pm25-120)*(100/130)
    else:
        return 400 + (pm25-250)*(100/130)


def get_category(aqi):

    if aqi<=50:
        return "Good","#00B050"
    elif aqi<=100:
        return "Satisfactory","#92D050"
    elif aqi<=200:
        return "Moderate","#FFFF00"
    elif aqi<=300:
        return "Poor","#FFC000"
    elif aqi<=400:
        return "Very Poor","#FF0000"
    else:
        return "Severe","#C00000"