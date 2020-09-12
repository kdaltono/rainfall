<?php 
    class Rainfall {
        public $RainfallId;
        public $Year;
        public $Month;
        public $Value;

        public function __construct($id, $year, $month, $value) {
            $this->RainfallId = $id;
            $this->Year = $year;
            $this->Month = $month;
            $this->Value = $value;
        }

        public function getId() {
            return $this->RainfallId;
        }

        public function getYear() {
            return $this->Year;
        }

        public function getMonth() {
            return $this->Month;
        }

        public function getValue() {
            return $this->Value;
        }
    }
?>