from gpsdclient import GPSDClient


from gpsdclient import GPSDClient

def get_Coords():
    coords = []
    with GPSDClient() as client:
        # Wait until a device is present
        for result in client.dict_stream(filter=["DEVICES"]):
            devices = result.get("devices", [])
            if not devices:
                return 0, 0
            break

        # Wait for a valid fix
        for result in client.dict_stream(filter=["TPV"]):
            mode = result.get("mode", 0)

            if mode >= 1: #if lat and lon are vali
                lat = result.get("lat", "0")
                lon = result.get("lon", "0")
                return lat, lon


        
get_Coords()