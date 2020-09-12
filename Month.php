<?php 
    class Month {

        public $monthID;
        public $monthName;
        public $monthDayCount;

        public function __construct($id, $name, $dayCount) {
            $this->monthID = $id;
            $this->monthName = $name;
            $this->monthDayCount = $dayCount;
        }

        public function getId() {
            return $this->monthID;
        }

        public function getName() {
            return $this->monthName;
        }

        public function getDayCount() {
            return $this->monthDayCount;
        }
    }
?>