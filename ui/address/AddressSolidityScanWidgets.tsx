import { Grid, Flex, Text, Separator, Icon } from '@chakra-ui/react';

// eslint-disable-next-line no-restricted-imports
import solidityScanIcon from 'icons/brands/solidity_scan.svg';
import { Link, LinkBox } from 'toolkit/chakra/link';
import { Skeleton } from 'toolkit/chakra/skeleton';
import { Hint } from 'toolkit/components/Hint/Hint';
import SolidityscanReportScore from 'ui/shared/solidityscanReport/SolidityscanReportScore';

interface Props {
  data: {
    scan_report: {
      scan_summary: {
        score_v2: string;
        issue_severity_distribution: {
          critical: number;
          gas: number;
          high: number;
          informational: number;
          low: number;
          medium: number;
        };
      };
      contractname: string;
      scan_status: string;
      scanner_reference_url: string;
    };
  } | undefined;
  isLoading?: boolean;
  isError?: boolean;
}

const AddressSolidityScanWidgets = ({ isLoading, data, isError }: Props) => {

  if (isError || !data) {
    return null;
  }

  const score = Number(data?.scan_report.scan_summary.score_v2);

  if (!score) {
    return null;
  }

  return (
    <Flex w="full" direction="column" alignItems="flex-start" gap={ 3 }>
      <Grid
        gap={ 3 }
        templateColumns={{
          base: 'repeat(1, minmax(0, 1fr));',
          xl: 'repeat(3, minmax(0, 1fr));',
        }}
        w="full"
      >
        <LinkBox
          as={ Flex }
          className="group"
          flexDirection="column"
          p={ 3 }
          cursor="pointer"
          borderRadius="md"
          border="1px solid"
          borderColor="transparent"
          bgColor={{ _light: 'blackAlpha.50', _dark: 'whiteAlpha.100' }}
          transition="border-color 0.2s ease-in-out"
          _hover={{
            borderColor: { _light: 'blackAlpha.200', _dark: 'whiteAlpha.200' },
          }}
        >
          <Skeleton loading={ isLoading } minW="88px" alignSelf="flex-start">
            <SolidityscanReportScore score={ score } mb={ 5 }/>
          </Skeleton>
          <Flex alignItems="center" gap={ 1 } mt={ 1 }>
            <Text textStyle="sm">SolidityScan</Text>
            <Hint
              label="Contract analyzed for 240+ vulnerability patterns by SolidityScan"
              tooltipProps={{ positioning: { placement: 'bottom' } }}
            />
          </Flex>

          <Separator mt={ 3 } mb={ 2 } borderColor={{ _light: 'blackAlpha.50', _dark: 'whiteAlpha.100' }}/>
          <Link href={ data.scan_report.scanner_reference_url } external>
            <Flex alignItems="center" gap={ 2 }>
              <Icon as={ solidityScanIcon } mr={ 1 } ml="6px" w="23px" h="20px" display="inline-block" verticalAlign="middle"/>
              <Flex
                alignItems="center"
                justifyContent="space-between"
                flex={ 1 }
              >
                <Text
                  textStyle="xs"
                  color="text.secondary"
                  _groupHover={{ color: 'hover' }}
                >
                  View full report
                </Text>
              </Flex>
            </Flex>
          </Link>
        </LinkBox>
      </Grid>
    </Flex>
  );
};

export default AddressSolidityScanWidgets;
