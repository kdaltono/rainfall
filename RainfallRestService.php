<?php 
    require "dbinfo.php";
    require "RestService.php";
    require "Rainfall.php";
    require "Year.php";
    require "Month.php";

    class RainfallRestService extends RestService {
        private $rainfall;
        private $years;
        private $months;

        private $yearPos;
        private $monthPos;

        public function __construct() {
            parent::__construct("rainfall");
            // Layout:
            // http://server/api.php?q=rainfall/year/month
        }

        public function performGet($url, $parameters, $requestBody, $accept) {
            switch (count($parameters)) {
                case 4:
                    $year = $parameters[1];
                    $month = $parameters[2];
                    $d = $parameters[3];
                    if (is_numeric($year) && is_numeric($month) && $d == 'd') {
                        $this->getAllMonthsOfID($year, $month);
                        header('Content-Type: application/json; charset=utf-8');
                        header('no-cache,no-store');
                        echo json_encode($this->yearPos);
                    } else if (is_numeric($year) && is_numeric($month) && $d == 'y') {
                        $this->getAllMonthsOfYear($year, $month);
                        header('Content-Type: application/json; charset=utf-8');
                        header('no-cache,no-store');
                        echo json_encode($this->monthPos);
                    } else {
                        $this->notFoundResponse();
                    }
                    break;
                case 3:
                    $year = $parameters[1];
                    $month = $parameters[2];
                    if (is_numeric($year) && is_numeric($month)) {
                        $this->getRainfallByDate($year, $month);
                        header('Content-Type: application/json; charset=utf-8');
                        header('no-cache,no-store');
                        echo json_encode($this->rainfall);
                    } else if (is_numeric($year) && $month == 'all') {
                        $this->getMonths($year);
                        header('Content-Type: application/json; charset=utf-8');
                        header('no-cache,no-store');
                        echo json_encode($this->months);
                    } else {
                        $this->notFoundResponse();
                    }
                    break;
                case 2:
                    // Could be asking for all years:
                    $year = $parameters[1];
                    if (is_int($year)) {
                        
                    } else if ($year == 'all') {
                        $this->getYears();
                        header('Content-Type: application/json; charset=utf-8');
                        header('no-cache,no-store');
                        echo json_encode($this->years);
                    } else {
                        $this->notFoundResponse();
                    }
                    break;
                default:
                    $this->methodNotAllowedResponse();
                    break;
            }
        }

        public function performPost($url, $parameters, $requestBody, $accept) {
            global $dbserver, $dbusername, $dbpassword, $dbdatabase;

            $newRainfall = $this->extractRainfallFromJson($requestBody);
            $connection = new mysqli($dbserver, $dbusername, $dbpassword, $dbdatabase);
            if (!$connection->connect_error) {
                $sql = "insert into RAINFALL (MonthID, RainfallVal, YearID) values (?, ?, ?)";
                $statement = $connection->prepare($sql);
                $month = $newRainfall->getMonth();
                $value = $newRainfall->getValue();
                $year = $newRainfall->getYear();
                if (is_numeric($month) && is_numeric($value) && is_numeric($year)) {
                    $statement->bind_param('sss', $month, $value, $year);
                    $result = $statement->execute();
                    if ($result == FALSE) {
                        $errorMessage = $statement->error;
                    }
                    $statement->close();
                    $connection->close();
                    if ($result == TRUE) {
                        $this->noContentResponse();
                    } else {
                        $this->errorResponse($errorMessage);
                    }
                } else {
                    $statement->close();
                    $connection->close();
                    $this->noContentResponse();
                }
            }
        }

        public function performPut($url, $parameters, $requestBody, $accept) {
            global $dbserver, $dbusername, $dbpassword, $dbdatabase;

            $newRainfall = $this->extractRainfallFromJson($requestBody);
            $connection = new mysqli($dbserver, $dbusername, $dbpassword, $dbdatabase);
            if (!$connection->connect_error) {
                $sql = "update RAINFALL set MonthID = ?, RainfallVal = ?, YearID = ? where RainfallID = ?";

                $statement = $connection->prepare($sql);
                $id = $newRainfall->getId();
                $month = $newRainfall->getMonth();
                $value = $newRainfall->getValue();
                $year = $newRainfall->getYear();
                if (is_numeric($id) && is_numeric($month) && is_numeric($value) && is_numeric($year)) {
                    $statement->bind_param('ssss', $month, $value, $year, $id);
                    $result = $statement->execute();
                    if ($result == FALSE) {
                        $errorMessage = $statement->error;
                    }
                    $statement->close();
                    $connection->close();
                    if ($result == TRUE) {
                        $this->noContentResponse();
                    } else {
                        $this->errorResponse($errorMessage);
                    }
                } else {
                    $statement->close();
                    $connection->close();
                }
            }
        }

        public function performDelete($url, $parameters, $requestBody, $accept) {
            global $dbserver, $dbusername, $dbpassword, $dbdatabase;

            if (count($parameters) == 3) {
                $connection = new mysqli($dbserver, $dbusername, $dbpassword, $dbdatabase);
                if (!$connection->connect_error) {
                    $yearID = $parameters[1];
                    $monthID = $parameters[2];
                    $sql = "delete from RAINFALL where YearID = ? AND MonthID = ?";
                    $statement = $connection->prepare($sql);
                    $statement->bind_param('ss', $yearID, $monthID);
                    $result = $statement->execute();
                    if ($result == FALSE) {
                        $errorMessage = $statement->error;
                    }
                    $statement->close();
                    $connection->close();
                    if ($result == TRUE) {
                        $this->noContentResponse();
                    } else {
                        $this->errorResponse($errorMessage);
                    }
                }
            }
        }

        public function getRainfallByDate($year, $month) {
            global $dbserver, $dbusername, $dbpassword, $dbdatabase;

            $connection = new mysqli($dbserver, $dbusername, $dbpassword, $dbdatabase);

            if (!$connection->connect_error) {
                $query = "select RainfallID, MonthID, RainfallVal, YearID from RAINFALL where MonthID = ? AND YearID = ?";
                $statement = $connection->prepare($query);
                $statement->bind_param('ii', $month, $year);
                $statement->execute();
                $statement->store_result();
                $statement->bind_result($rId, $rMonth, $rRainfall, $rYear);
                while ($statement->fetch()) {
                    $this->rainfall = new Rainfall($rId, $rYear, $rMonth, $rRainfall);
                }

                $statement->close();
                $connection->close();
            }
        }

        public function getAllMonthsOfID($year, $month) {
            global $dbserver, $dbusername, $dbpassword, $dbdatabase;

            $connection = new mysqli($dbserver, $dbusername, $dbpassword, $dbdatabase);
            if (!$connection->connect_error) {
                $query = "select RainfallVal, YearID from RAINFALL where MonthID = ? ORDER BY RainfallVal DESC";
                $statement = $connection->prepare($query);
                $statement->bind_param('i', $month);
                $statement->execute();
                $statement->store_result();
                $statement->bind_result($rValue, $rYear);
                $count = 1;
                while ($statement->fetch()) {
                    if ($year == $rYear) {
                        $this->yearPos = $count;
                        return $count;
                    } else {
                        ++$count;
                    }
                }

                $statement->close();
                $connection->close();
            }
        }

        public function getAllMonthsOfYear($year, $month) {
            global $dbserver, $dbusername, $dbpassword, $dbdatabase;

            $connection = new mysqli($dbserver, $dbusername, $dbpassword, $dbdatabase);
            if (!$connection->connect_error) {
                $query = "select RainfallVal, MonthID from RAINFALL where YearID = ? ORDER BY RainfallVal DESC";
                $statement = $connection->prepare($query);
                $statement->bind_param('i', $year);
                $statement->execute();
                $statement->store_result();
                $statement->bind_result($rVal, $rMonth);
                $count = 1;
                while ($statement->fetch()) {
                    if ($month == $rMonth) {
                        $this->monthPos = $count;
                        return $count;
                    } else {
                        ++$count;
                    }
                }
            }
        }

        public function getYears() {
            global $dbserver, $dbusername, $dbpassword, $dbdatabase;

            $connection = new mysqli($dbserver, $dbusername, $dbpassword, $dbdatabase);
            if (!$connection->connect_error) {
                $query = "select * from YEARS";
                if ($result = $connection->query($query)) {
                    while ($row = $result->fetch_assoc()) {
                        $this->years[] = new Year($row['YearID']);
                    }
                    $result->close();
                }
                $connection->close();
            }
        }

        public function getMonths($year) {
            global $dbserver, $dbusername, $dbpassword, $dbdatabase;

            $connection = new mysqli($dbserver, $dbusername, $dbpassword, $dbdatabase);
            if (!$connection->connect_error) {
                $query = "select MonthID, MonthName, MonthDayCount from MONTHS where MonthID in (select MonthID from RAINFALL where YearID = ?)";
                $statement = $connection->prepare($query);
                $statement->bind_param('s', $year);
                $statement->execute();
                $statement->store_result();
                $statement->bind_result($monthID, $monthName, $monthCount);
                while ($statement->fetch()) {
                    $this->months[] = new Month($monthID, $monthName, $monthCount);
                }

                $statement->close();
                $connection->close();
            }
        }

        public function extractRainfallFromJson($requestBody) {
            $rainfallArray = json_decode($requestBody, true);
            $rainfall = new Rainfall($rainfallArray['RainfallID'],
                    $rainfallArray['YearID'],
                    $rainfallArray['MonthID'],
                    $rainfallArray['RainfallVal']);
            unset($rainfallArray);
            return $rainfall;
        }
    }
?>