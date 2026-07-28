import { createAppStack } from '../createStack';
import { EventsListScreen } from '@/screens/events/EventsListScreen';
import { CreateEventScreen } from '@/screens/events/CreateEventScreen';
import { EditEventScreen } from '@/screens/events/EditEventScreen';
import { DeleteEventScreen } from '@/screens/events/DeleteEventScreen';
import { EventDetailsScreen } from '@/screens/events/EventDetailsScreen';
import { EventGuestsScreen } from '@/screens/events/EventGuestsScreen';
import { GuestDetailsScreen } from '@/screens/guests/GuestDetailsScreen';
import { RegisterGuestScreen } from '@/screens/guests/RegisterGuestScreen';
import { ExcelUploadScreen } from '@/screens/guests/ExcelUploadScreen';
import { InvitationScreen } from '@/screens/guests/InvitationScreen';
import { QrScannerScreen } from '@/screens/tickets/QrScannerScreen';
import { CheckInSuccessScreen } from '@/screens/tickets/CheckInSuccessScreen';
import { AlreadyUsedScreen } from '@/screens/tickets/AlreadyUsedScreen';
import type { EventsStackParamList } from '../types';
import { modalScreenOptions } from '../options';

const { AppStack } = createAppStack<EventsStackParamList>();

export function EventsStackNavigator() {
  return (
    <AppStack
      initialRouteName="EventsList"
      screens={[
        { name: 'EventsList', component: EventsListScreen },
        {
          name: 'CreateEvent',
          component: CreateEventScreen,
          options: modalScreenOptions,
        },
        { name: 'EditEvent', component: EditEventScreen },
        { name: 'DeleteEvent', component: DeleteEventScreen },
        { name: 'EventDetails', component: EventDetailsScreen },
        { name: 'EventGuests', component: EventGuestsScreen },
        { name: 'GuestDetails', component: GuestDetailsScreen },
        { name: 'RegisterGuest', component: RegisterGuestScreen },
        { name: 'ExcelUpload', component: ExcelUploadScreen },
        {
          name: 'Invitation',
          component: InvitationScreen,
          options: modalScreenOptions,
        },
        { name: 'QrScanner', component: QrScannerScreen },
        { name: 'CheckInSuccess', component: CheckInSuccessScreen },
        { name: 'AlreadyUsed', component: AlreadyUsedScreen },
      ]}
    />
  );
}
