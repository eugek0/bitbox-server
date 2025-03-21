import datetime
import os
import json

basedir = os.path.abspath(os.path.dirname(__file__))


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'Pfndsn7452BNBw1'
    if os.path.exists('version.json'):
        with open("version.json", "r") as read_file:
            json_data = json.load(read_file)
            SECRET_KEY = json_data['passkey']
            BUILD_DATE = json_data['Build_date']

    # SQLALCHEMY_COMMIT_ON_TEARDOWN = True
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    configwebsockURL = '192.168.0.62'
    FILELST_FOLDER = '/PROG_38/TEMP/FILELST_FOLDER/'
    GL_PROD_IP = '0.0.0.0'
    GL_PROD_PORT = '5000'
    JWT_EXPIRATION_DELTA = datetime.timedelta(days=1)
    SQLALCHEMY_POOL_SIZE = 150
    SQLALCHEMY_MAX_OVERFLOW = 200
    BASEDIR = os.path.abspath(os.path.dirname(__file__)) + '/'
    PDF_TEMP_DIR = '/home/a/1/'
    PDF_SMB_PATH = {}
    PDF_SMB_PATH ['beaf410a-170d-4617-a0ef-15b6f38ad864'] = {'userID': 'Lesha', 'password': '241', 'client_machine_name': '192.168.0.40', 'server_name': '192.168.0.73', 'serverip': '192.168.0.73', 'folder': 'Temp'}
    REGISTRY = 1
    IMPORT_PACIENT = False
    RIR_IN_SERVICE = False
    MAIN_LPU = '6bd90610-1553-4851-b067-dffbb52ffa09'
    AUTO_NIBLZ = False
    AUTO_NIBLZ_POST_HOSP = True
    UNO_SOURCE_DIR = '/usr/lib64/python3.8/site-packages'

    CDUSER_MO = '2c5b1cce-2d9a-4676-99a2-99c8f0f3b54b'
    EMDR_SMB_PATH = {
'userID': 'fugina',
'password': 'Qweqaz226',
'client_machine_name': 'fugina',
'server_name': 'LPU_22',
'serverip': '192.168.0.155',
'folder': 'signed_xml_from_5999',
'domain': 'elmed.local'
  }

    # SQLALCHEMY_ECHO = True

    #Авторизационный ключ для федерального сервиса справочников nsi, необходимый для получения ответов сервера, если в осмотрах в параметрами используются фед. справочники, используются РЭМДы
    #На сайте https://nsi.rosminzdrav.ru/ Нужно авторизироваться через госуслуги и получить этот ключ
    EGISZ_KEY = 'ab9dd3e6-6f98-4056-b20e-8ab8a63f18a4'

    #Авторизационный ключ для ТЕСТОВОЙ или БОЕВОЙ(В промышленной среде) справочной системы нетрики, необходимый для получения ответов сервера.
    #Чтобы получить ключи, нужно написать в тех. поддержку нетрики
    #ТЕСТОВЫЙ - '6c7075cd-6491-4da1-8a41-fff7fb246c8d'
    #БОЕВОЙ - '905827af-aa91-48c4-a168-eafbd8d1df76'
    NETR_KEY = '6c7075cd-6491-4da1-8a41-fff7fb246c8d'


    #URI для ТЕСТОВОЙ справочной системы нетрики по Ростовской области или БОЕВОЙ(В промышленной среде), необходимый для получения ответов сервера.
    #ТЕСТОВЫЙ - 'http://r61-rc.zdrav.netrika.ru/nsi/fhir/term/'
    #БОЕВОЙ - 'http://10.52.32.224/nsi/fhir/term/'
    NETR_URI = 'http://r61-rc.zdrav.netrika.ru/nsi/fhir/term/'

    @staticmethod
    def init_app(app):
        pass


class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE') or\
        'postgresql://postgres:Manager1@192.168.0.171:5432/webmis_master'
    SQLLPU_URI = 'DRIVER={ODBC Driver 17 for SQL Server};SERVER=192.168.1.69\\sqlexpress,54783;'\
                 'DATABASE=polstacoi_0107;UID=sa;PWD=1'
    SQLLPU_ALCH_URI = 'mssql+pyodbc://sa:prog_11@192.168.0.38@sqlexpress/polstacoi_0107?driver=ODBC+Driver+17+for+SQL+Server'

    #SQLHB_URI = 'DRIVER={ODBC Driver 17 for SQL Server};SERVER=192.168.1.69\sqlexpress,54783;' \
    #            'DATABASE=RNIOI_0107;UID=sa;PWD=1'

    SQLLPU_URI = 'DRIVER=SQL Server Native Client 11.0;SERVER=192.168.0.94\SQL2014_DEV,60661; ' \
                 'DATABASE=polstac_cgb;UID=sa;PWD=Qwe1'

    SQLHB_URI = 'DRIVER=SQL Server Native Client 11.0;SERVER=192.168.0.94\SQL2014_DEV,60661;' \
                'DATABASE=cgb;UID=sa;PWD=Qwe1'

    LOG_DATABASE_URI= 'postgresql://postgres:Manager1@192.168.0.171:5432/webmislog'

    #SQLAPTEKA_URI = 'DRIVER={ODBC Driver 17 for SQL Server};SERVER=192.168.0.66\sqlexpress,58839;' \
    #                'DATABASE=Apteka;UID=sa;PWD=1'
    SQLAPTEKA_URI = 'DRIVER={ODBC Driver 17 for SQL Server};SERVER=192.168.0.66\sqlexpress,58839;'\
                    'DATABASE=Apteka;UID=sa;PWD=1'
    #PGSQLPHARAMCY_URL = os.environ.get('DATABASE') or \
    #                          'postgresql://postgres:Manager1@192.168.0.83:5432/Apteka2'
    #PGSQLPHARAMCY_URL = os.environ.get('DATABASE') or \
    #                          'postgresql://postgres:fyxcthdth161@192.168.0.143:5432/Apteka'
    PGSQLPHARAMCY_URL = os.environ.get('DATABASE') or \
                              'postgresql://postgres:fyxcthdth161@192.168.0.143:5432/medaccount'

    SQLEGISZ_URI = 'postgresql://postgres:Manager1@192.168.0.171:5432/egisz'

    #SQLEMDR_URI = 'postgresql://wwwuser:UkI821LLa@192.168.0.204:5433/EMDR'
    SQLEMDR_URI = 'postgresql://postgres:Manager1@192.168.0.171:5432/EMDR'

    SQLFIAS_URI = 'postgresql://postgres:Kva999@192.168.1.21:5433/fias'
#    SQLFIAS_URI = 'postgresql://postgres:Kva579Kva@192.168.0.204:5433/fias'


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE') or\
        'postgres://kas:123@local:5432/webMis'


class ProductionConfig(Config):
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE') or\
        'postgres://kas:123@local:5432/webMis'


config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}

